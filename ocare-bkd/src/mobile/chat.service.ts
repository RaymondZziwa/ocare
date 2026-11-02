import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from './push.service';
import { OrderMailService } from './order-mail.service';

const MAX_MESSAGE = 2000;
const WELCOME =
  "Hi! You're chatting with the Ocare pharmacy team. Ask about medicines, dosage or your order and a pharmacist will reply here.";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly mail: OrderMailService,
  ) {}

  private async threadFor(clientId: string) {
    const existing = await this.prisma.chatThread.findUnique({ where: { clientId } });
    if (existing) return existing;
    return this.prisma.chatThread.create({
      data: {
        clientId,
        lastMessage: WELCOME,
        messages: { create: { sender: 'SYSTEM', body: WELCOME } },
      },
    });
  }

  private present(m: any) {
    return {
      id: m.id,
      sender: m.sender,
      body: m.body,
      orderId: m.orderId,
      createdAt: m.createdAt,
      staffName: m.employee ? m.employee.firstName : undefined,
    };
  }

  // ───────────── Customer ─────────────
  async clientMessages(clientId: string, after?: string) {
    const thread = await this.threadFor(clientId);
    const messages = await this.prisma.chatMessage.findMany({
      where: { threadId: thread.id, ...(after ? { createdAt: { gt: new Date(after) } } : {}) },
      orderBy: { createdAt: 'asc' },
      take: after ? 100 : 300,
      include: { employee: { select: { firstName: true } } },
    });
    return { status: 200, data: { unread: thread.clientUnread, messages: messages.map((m) => this.present(m)) } };
  }

  async clientUnread(clientId: string) {
    const thread = await this.prisma.chatThread.findUnique({ where: { clientId } });
    return { status: 200, data: { unread: thread?.clientUnread || 0 } };
  }

  async clientSend(clientId: string, body: string, orderId?: string) {
    const text = (body || '').trim();
    if (!text) throw new BadRequestException('Type a message first.');
    if (text.length > MAX_MESSAGE) throw new BadRequestException('Message is too long.');
    const thread = await this.threadFor(clientId);
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: { threadId: thread.id, sender: 'CLIENT', body: text, orderId: orderId || null },
      }),
      this.prisma.chatThread.update({
        where: { id: thread.id },
        data: { lastMessage: text, lastMessageAt: new Date(), staffUnread: { increment: 1 } },
      }),
    ]);
    return { status: 201, data: this.present(message) };
  }

  async clientMarkRead(clientId: string) {
    await this.prisma.chatThread.updateMany({ where: { clientId }, data: { clientUnread: 0 } });
    return { status: 200 };
  }

  // ───────────── Staff ─────────────
  async staffThreads() {
    const threads = await this.prisma.chatThread.findMany({
      orderBy: [{ staffUnread: 'desc' }, { lastMessageAt: 'desc' }],
      take: 200,
      include: { client: { select: { id: true, fullName: true, phone: true, email: true, deletedAt: true } } },
    });
    return { status: 200, data: threads.filter((t) => !t.client.deletedAt) };
  }

  async staffMessages(threadId: string, after?: string) {
    const thread = await this.prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Conversation not found');
    const messages = await this.prisma.chatMessage.findMany({
      where: { threadId, ...(after ? { createdAt: { gt: new Date(after) } } : {}) },
      orderBy: { createdAt: 'asc' },
      take: 300,
      include: { employee: { select: { firstName: true } } },
    });
    return { status: 200, data: messages.map((m) => this.present(m)) };
  }

  async staffSend(threadId: string, employeeId: string, body: string) {
    const text = (body || '').trim();
    if (!text) throw new BadRequestException('Type a reply first.');
    if (text.length > MAX_MESSAGE) throw new BadRequestException('Message is too long.');
    const thread = await this.prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Conversation not found');

    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: { threadId, sender: 'STAFF', employeeId, body: text },
        include: { employee: { select: { firstName: true } } },
      }),
      this.prisma.chatThread.update({
        where: { id: threadId },
        data: { lastMessage: text, lastMessageAt: new Date(), clientUnread: { increment: 1 }, staffUnread: 0 },
      }),
    ]);

    await this.push.notifyClient(thread.clientId, {
      title: 'Ocare pharmacist',
      body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
      route: '/chat',
    });
    // Email only for the first unread reply, so customers aren't flooded
    if (thread.clientUnread === 0) void this.mail.pharmacistReplied(thread.clientId, text);
    return { status: 201, data: this.present(message) };
  }

  async staffMarkRead(threadId: string) {
    await this.prisma.chatThread.update({ where: { id: threadId }, data: { staffUnread: 0 } });
    return { status: 200 };
  }

  /** Posts an automatic note into the customer's chat (e.g. order updates). */
  async systemNote(clientId: string, body: string, orderId?: string) {
    const thread = await this.threadFor(clientId);
    await this.prisma.$transaction([
      this.prisma.chatMessage.create({ data: { threadId: thread.id, sender: 'SYSTEM', body, orderId: orderId || null } }),
      this.prisma.chatThread.update({ where: { id: thread.id }, data: { lastMessage: body, lastMessageAt: new Date() } }),
    ]);
  }
}
