import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';
import { z } from 'zod';
import { savePricelistSchema } from '$lib/validation/savePricelists.validate';
import type { Prisma, Pricelists } from '@prisma/client';
import { setMonetaryValue } from '$lib/services/monetary';

export const pricelists = router({
  getPricelists: protectedProcedure.input(z.object({
    group: z.string().optional()
  })).query(async ({ input }) => {

    type ObjectKeys = keyof Pricelists

    const objectKeys = Object.keys(input)[0] as ObjectKeys;

    let query: Prisma.PricelistsFindManyArgs;

    const containsArg = input[objectKeys]

    if (objectKeys) {
      query = {
        where: {
          isActive: true,
          [objectKeys]: {
            contains: containsArg,
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
  getDefaultPricelist: protectedProcedure.query(async () => {
    const pricelist = await prisma.pricelists.findMany({
      where: {
        isDefault: {
          equals: true
        }
      },
      include: {
        PricelistDetails: true
      }
    });

    if (pricelist.length > 1) {
      throw new Error("Default pricelist more than one");
    }

    if (pricelist.length === 0) {
      throw new Error("Default pricelist not found");
    }

    return pricelist[0];
  }),
  saveOrUpdatePricelist: protectedProcedure.input(savePricelistSchema).mutation(async ({ input, ctx }) => {

    if (!ctx?.userId) {
      throw new Error("User not authorised");
    }

    const createdBy = ctx.userId as number;

    if (input.isDefault) {
      changeCurrentDefault();
    }

    const { pricelistDetails, ...restPricelist } = input;

    const subPrices = pricelistDetails.map((list: any) => {
      return {
        ...list,
        pricePerThousandStitches: setMonetaryValue(list.pricePerThousandStitches),
        minimumPrice: setMonetaryValue(list.minimumPrice)
      };
    });

    if (input.id) {
      return await prisma.pricelists.update({
        where: {
          id: input.id
        },
        data: {
          ...restPricelist,
          createdBy,
          PricelistDetails: { createMany: { data: subPrices } }
        }
      });
    } else {
      return await prisma.pricelists.create({
        data: {
          ...restPricelist,
          createdBy,
          PricelistDetails: { createMany: { data: subPrices } }
        }
      });
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
  return await prisma.pricelists.updateMany({
    where: {
      isDefault: {
        equals: true
      }
    },
    data: { isDefault: false }
  });
};