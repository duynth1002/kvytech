import { Router } from 'express';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { uploadFileToS3 } from '../services/s3';

const router = Router();

// Store file in memory so we can upload it to S3 directly
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware to ensure user is seller
const requireSeller = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'SELLER') {
    return res.status(403).json({ error: 'Forbidden. Only sellers can access this.' });
  }
  next();
};

// Upload document
router.post('/documents', requireSeller, upload.single('document'), async (req: any, res: any) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No document file provided' });
    }

    const sellerId = req.user.id;

    // 1. Upload to S3
    const s3Key = await uploadFileToS3(file);

    // 2. Create document record and pending verification attempt
    const document = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const doc = await tx.document.create({
        data: {
          sellerId,
          s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        }
      });

      const attempt = await tx.verificationAttempt.create({
        data: {
          documentId: doc.id,
          status: 'PENDING',
        }
      });

      await tx.auditLog.create({
        data: {
          verificationAttemptId: attempt.id,
          actor: sellerId,
          action: 'DOCUMENT_UPLOADED',
          newStatus: 'PENDING',
        }
      });

      return { doc, attempt };
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to process document upload' });
  }
});

// Get seller's documents and status
router.get('/documents', requireSeller, async (req: any, res: any) => {
  try {
    const documents = await prisma.document.findMany({
      where: { sellerId: req.user.id },
      include: {
        verificationAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(documents);
  } catch (error) {
    console.error('Fetch documents error:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export default router;
