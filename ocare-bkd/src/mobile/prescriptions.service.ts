import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from './push.service';
import { prescriptionFilePath } from './private-storage';

export const DEFAULT_PRESCRIPTION_VALID_DAYS = 90;

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  // ───────────── Customer ─────────────
  async create(clientId: string, files: Express.Multer.File[], notes?: string) {
    if (!files?.length) throw new BadRequestException('Add at least one photo of your prescription.');
    const prescription = await this.prisma.prescription.create({
      data: { clientId, images: files.map((f) => f.filename), notes: notes?.trim() || null },
    });
    return {
      status: 201,
      message: 'Prescription sent. A pharmacist will review it shortly.',
      data: this.present(prescription),
    };
  }

  async listForClient(clientId: string) {
    const rows = await this.prisma.prescription.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return { status: 200, data: rows.map((r) => this.present(r)) };
  }

  async imagePathForClient(clientId: string, id: string, index: number) {
    const p = await this.prisma.prescription.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Prescription not found');
    if (p.clientId !== clientId) throw new ForbiddenException();
    return this.imagePath(p.images, index);
  }

  /**
   * Used by checkout: throws unless the client has a valid, approved prescription
   * that covers every prescription-only item in the cart.
   */
  async assertCovers(clientId: string, prescriptionId: string | undefined, itemIds: string[]) {
    const rxItems = await this.prisma.item.findMany({
      where: { id: { in: itemIds }, requiresPrescription: true },
      select: { id: true, name: true },
    });
    if (rxItems.length === 0) return null;

    if (!prescriptionId) {
      throw new BadRequestException(
        `A pharmacist-approved prescription is needed for: ${rxItems.map((i) => i.name).join(', ')}.`,
      );
    }
    const p = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!p || p.clientId !== clientId) throw new BadRequestException('That prescription was not found on your account.');
    if (p.status !== 'APPROVED') throw new BadRequestException('Your prescription has not been approved yet.');
    if (p.validUntil && p.validUntil < new Date()) throw new BadRequestException('Your prescription has expired. Please upload a new one.');

    const approved = Array.isArray(p.approvedItems) ? (p.approvedItems as string[]) : [];
    if (approved.length) {
      const missing = rxItems.filter((i) => !approved.includes(i.id));
      if (missing.length) {
        throw new BadRequestException(
          `Your prescription doesn't cover: ${missing.map((i) => i.name).join(', ')}.`,
        );
      }
    }
    return p.id;
  }

  // ───────────── Staff ─────────────
  async listForStaff(status?: string) {
    const where = status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status) ? { status: status as any } : {};
    const rows = await this.prisma.prescription.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 200,
      include: {
        client: { select: { id: true, fullName: true, phone: true, email: true } },
        reviewer: { select: { firstName: true, lastName: true } },
      },
    });
    return { status: 200, data: rows.map((r) => ({ ...this.present(r), client: r.client, reviewer: r.reviewer })) };
  }

  async imagePathForStaff(id: string, index: number) {
    const p = await this.prisma.prescription.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Prescription not found');
    return this.imagePath(p.images, index);
  }

  async review(
    id: string,
    employeeId: string,
    dto: { status: 'APPROVED' | 'REJECTED'; reviewNotes?: string; approvedItemIds?: string[]; validDays?: number },
  ) {
    if (!['APPROVED', 'REJECTED'].includes(dto.status)) throw new BadRequestException('Choose approve or reject');
    if (dto.status === 'REJECTED' && !dto.reviewNotes?.trim()) {
      throw new BadRequestException('Tell the customer why the prescription was rejected.');
    }
    const p = await this.prisma.prescription.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Prescription not found');

    const days = Number(dto.validDays) > 0 ? Number(dto.validDays) : DEFAULT_PRESCRIPTION_VALID_DAYS;
    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNotes: dto.reviewNotes?.trim() || null,
        reviewedBy: employeeId,
        reviewedAt: new Date(),
        approvedItems: dto.status === 'APPROVED' ? (dto.approvedItemIds || []) : undefined,
        validUntil: dto.status === 'APPROVED' ? new Date(Date.now() + days * 86_400_000) : null,
      },
    });

    await this.push.notifyClient(p.clientId, {
      title: dto.status === 'APPROVED' ? 'Prescription approved' : 'Prescription needs attention',
      body:
        dto.status === 'APPROVED'
          ? 'You can now order your prescription medicines.'
          : dto.reviewNotes?.trim() || 'A pharmacist could not approve your prescription.',
      route: '/prescriptions',
    });

    return { status: 200, message: `Prescription ${dto.status.toLowerCase()}`, data: this.present(updated) };
  }

  // ───────────── Helpers ─────────────
  private imagePath(images: unknown, index: number) {
    const list = Array.isArray(images) ? (images as string[]) : [];
    const name = list[index];
    if (!name) throw new NotFoundException('Image not found');
    const path = prescriptionFilePath(name);
    if (!existsSync(path)) throw new NotFoundException('Image file missing');
    return path;
  }

  removeFiles(images: unknown) {
    const list = Array.isArray(images) ? (images as string[]) : [];
    for (const name of list) {
      try {
        const path = prescriptionFilePath(name);
        if (existsSync(path)) unlinkSync(path);
      } catch {
        /* ignore */
      }
    }
  }

  private present(p: any) {
    const images = Array.isArray(p.images) ? p.images : [];
    const expired = p.status === 'APPROVED' && p.validUntil && new Date(p.validUntil) < new Date();
    return {
      id: p.id,
      status: expired ? 'EXPIRED' : p.status,
      notes: p.notes,
      reviewNotes: p.reviewNotes,
      reviewedAt: p.reviewedAt,
      validUntil: p.validUntil,
      approvedItems: p.approvedItems || [],
      imageCount: images.length,
      createdAt: p.createdAt,
    };
  }
}
