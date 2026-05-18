import { Router } from 'express';
import { Prisma, VerificationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Get all pending and inconclusive verifications
router.get('/verifications', requireAdmin, async (req: any, res: any) => {
  try {
    const verifications = await prisma.verificationAttempt.findMany({
      where: {
        status: {
          in: ['PENDING', 'INCONCLUSIVE']
        }
      },
      include: {
        document: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(verifications);
  } catch (error) {
    console.error('Fetch verifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

// Submit manual review decision
router.post('/verifications/:id/review', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body;
    const adminId = req.user.id;

    if (!['MANUAL_APPROVED', 'MANUAL_REJECTED'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    const attempt = await prisma.verificationAttempt.findUnique({
      where: { id }
    });

    if (!attempt || attempt.status !== 'INCONCLUSIVE') {
      return res.status(400).json({ error: 'Verification attempt not found or not in INCONCLUSIVE state' });
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedAttempt = await tx.verificationAttempt.update({
        where: { id },
        data: {
          status: decision as VerificationStatus,
          resultReason: reason || null,
          adminId
        }
      });

      await tx.auditLog.create({
        data: {
          verificationAttemptId: id,
          actor: adminId,
          action: 'MANUAL_REVIEW_SUBMITTED',
          previousStatus: attempt.status,
          newStatus: updatedAttempt.status,
        }
      });

      return updatedAttempt;
    });

    return res.json(updated);
  } catch (error) {
    console.error('Manual review error:', error);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
