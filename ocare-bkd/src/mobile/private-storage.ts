import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { extname, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';

/**
 * Prescriptions are medical records, so they are NOT stored in the public
 * /uploads folder. They are only served through authenticated endpoints.
 */
export const PRIVATE_UPLOADS_DIR = resolve(
  process.env.PRIVATE_UPLOADS_DIR || join(process.cwd(), 'private-uploads'),
);
export const PRESCRIPTIONS_DIR = join(PRIVATE_UPLOADS_DIR, 'prescriptions');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];

export const prescriptionUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(PRESCRIPTIONS_DIR)) mkdirSync(PRESCRIPTIONS_DIR, { recursive: true });
      cb(null, PRESCRIPTIONS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = (extname(file.originalname) || '.jpg').toLowerCase().replace(/[^.a-z0-9]/g, '');
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 4 },
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new BadRequestException('Upload a photo (JPG, PNG, HEIC) or a PDF of your prescription.'), false);
  },
};

/** Resolve a stored file name safely (no path traversal). */
export const prescriptionFilePath = (fileName: string) => {
  const full = resolve(PRESCRIPTIONS_DIR, fileName);
  if (!full.startsWith(PRESCRIPTIONS_DIR)) throw new BadRequestException('Invalid file');
  return full;
};
