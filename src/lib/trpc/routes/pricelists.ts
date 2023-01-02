import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';
import { z } from 'zod';
import { savePricelistSchema } from '$lib/validation/savePricelists.validate';
import type { Prisma } from '@prisma/client';

export const pricelists = router({
  getPricelists: protectedProcedure.input(z.object({
    group: z.string().optional()
  })).query(async ({ input }) => {

    type ObjectKeys = keyof typeof input

    const objectKeys = Object.keys(input)[0] as ObjectKeys;

    let query: Prisma.PricelistsFindManyArgs;

    if (objectKeys) {
      query = {
        where: {
          isActive: true,
          [objectKeys]: {
            contains: input[objectKeys],
            mode: 'insensitive'
          }
        },
        orderBy: {

          id: 'asc'
        }
      };
    } else {
      query = {
        where: {
          isActive: true
        },
        orderBy: {
          id: 'asc'
        }
      };
    }

    return await prisma.pricelists.findMany(query);
  }),
  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const pricelist = await prisma.pricelists.findUnique({
      where: {
        id: input
      },
      include: {
        PricelistDetails: true
      }
    });

    return pricelist;
  }),
  saveOrUpdatePricelist: protectedProcedure.input(savePricelistSchema).mutation(async ({ input, ctx }) => {

    if (!ctx?.userId) {
      throw new Error("User not authorised");
    }

    const createdBy = ctx.userId as number;

    if (input.isDefault) {
      changeCurrentDefault();
    }

    const pricelist = { ...input, createdBy, };

    if (input.id) {
      return await prisma.pricelists.update({ where: { id: input.id }, data: pricelist });
    } else {
      return await prisma.pricelists.create({ data: pricelist });
    }

  }),
  deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    const pricelist = await prisma.pricelists.update({
      where: { id: input },
      data: { isActive: false }
    });

    return pricelist;
  })
});

export const changeCurrentDefault = async () => {
  await prisma.pricelists.updateMany({
    where: {
      isDefault: {
        equals: true
      }
    },
    data: { isDefault: false }
  });
};