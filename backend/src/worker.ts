import "dotenv/config";
import { Prisma, VerificationStatus } from "@prisma/client";
import { prisma } from "./lib/prisma";
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockVerificationService = async (documentId: string): Promise<{ status: VerificationStatus, reason?: string }> => {
  // Simulate network delay (2 to 5 seconds)
  await sleep(Math.floor(Math.random() * 3000) + 2000);

  const rand = Math.random();
  if (rand < 0.4) {
    return { status: 'VERIFIED' };
  } else if (rand < 0.7) {
    return { status: 'REJECTED', reason: 'Document image is blurry or expired.' };
  } else {
    return { status: 'INCONCLUSIVE', reason: 'System cannot extract required text confidently.' };
  }
};

async function processPendingVerifications() {
  console.log('Worker started, looking for PENDING verifications...');

  while (true) {
    try {
      // Find one pending verification (using a simple findFirst, in production use findMany with FOR UPDATE SKIP LOCKED)
      const pendingAttempt = await prisma.verificationAttempt.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' }
      });

      if (!pendingAttempt) {
        // Wait 5 seconds before polling again
        await sleep(5000);
        continue;
      }

      console.log(`Processing attempt: ${pendingAttempt.id} for document: ${pendingAttempt.documentId}`);

      const result = await mockVerificationService(pendingAttempt.documentId);

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const updated = await tx.verificationAttempt.update({
          where: { id: pendingAttempt.id },
          data: {
            status: result.status,
            resultReason: result.reason,
            externalReferenceId: `mock-ext-${Date.now()}`
          }
        });

        await tx.auditLog.create({
          data: {
            verificationAttemptId: updated.id,
            actor: 'SYSTEM',
            action: 'AUTOMATED_VERIFICATION_COMPLETED',
            previousStatus: 'PENDING',
            newStatus: updated.status,
          }
        });
      });

      console.log(`Completed attempt: ${pendingAttempt.id} -> ${result.status}`);

    } catch (error) {
      console.error('Worker error:', error);
      await sleep(5000); // Wait on error to avoid tight spin
    }
  }
}

/** Starts the mock verification loop without blocking the caller. Safe to call from the API process. */
export function startVerificationWorker(): void {
  void processPendingVerifications();
}

if (require.main === module) {
  startVerificationWorker();
}
