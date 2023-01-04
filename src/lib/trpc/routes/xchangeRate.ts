import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';
import { z } from 'zod';
import { saveXchangeRateSchema } from '$lib/validation/saveXchangeRate.validate';
import type { Prisma } from '@prisma/client';

export const xchangeRate = router({
  getXchangeRates: protectedProcedure.input(z.object({
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })).query(async ({ input }) => {

    type ObjectKeys = keyof typeof input

    const objectKeys = Object.keys(input)[0] as ObjectKeys;

    let whereQuery;

    if (objectKeys === 'isDefault' || objectKeys === 'isActive') {
      if (!input[objectKeys]) {
        return
      }
      whereQuery = {
        equals: input[objectKeys] === 'true'
      };
    }

    let query: Prisma.XchangeRateFindManyArgs;

    const baseQuery = {
      include: {
        XchangeRateDetails: true
      },
    };

    if (objectKeys) {
      query = {
        ...baseQuery,
        where: {
          isActive: true,
          [objectKeys]: whereQuery
        },

      };
    } else {
      query = {
        ...baseQuery,
        where: {
          isActive: true,
        }
      };
    }

    return await prisma.xchangeRate.findMany(query);
  }),
  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const xchangeRate = await prisma.xchangeRate.findUnique({
      where: {
        id: input
      },
      include: {
        XchangeRateDetails: true
      }
    });

    return xchangeRate;
  }),
  getDefaultXchangeRate: protectedProcedure.query(async () => {
    const xchangeRate = await prisma.xchangeRate.findMany({
      where: {
        isDefault: {
          equals: true
        }
      },
      include: {
        XchangeRateDetails: true
      }
    });

    if (xchangeRate.length > 1) {
      throw new Error("Default exchange rates are more than one");
    }

    return xchangeRate;
  }),
  saveOrUpdateXchangeRate: protectedProcedure.input(saveXchangeRateSchema).mutation(async ({ input, ctx }) => {

    if (!ctx?.userId) {
      throw new Error("User not authorised");
    }

    const createdBy = ctx.userId as number;

    if (input.isDefault) {
      changeCurrentDefault();
    }

    if (input?.xChangeRateDate) {
      input.xChangeRateDate = new Date(input.xChangeRateDate);
    }

    const { XchangeRateDetails, ...restRates } = input;

    const rateDetails = XchangeRateDetails.map((list) => {
      const { id, ...restObj } = list;
      return {
        ...restObj,
      };
    });

    const data = {
      ...restRates,
      createdBy,
      XchangeRateDetails: { createMany: { data: rateDetails } }
    }

    if (input.id) {
      return await prisma.xchangeRate.update({ where: { id: input.id }, data });
    } else {
      return await prisma.xchangeRate.create({ data });
    }

  }),

  deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    const xchangeRate = await prisma.xchangeRate.update({
      where: { id: input },
      data: { isActive: false }
    });

    return xchangeRate;
  })
});

export const changeCurrentDefault = async () => {
  return await prisma.xchangeRate.updateMany({
    where: {
      isDefault: {
        equals: true
      }
    },
    data: { isDefault: false }
  });
};