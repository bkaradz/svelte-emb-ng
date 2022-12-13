
import prisma from '$lib/prisma/client';
import { publicProcedure, router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';

export const test = router({
  getContacts: protectedProcedure
    .query(({ ctx }) =>
      prisma.contacts.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { updatedAt: 'desc' },

      })
    ),
});
