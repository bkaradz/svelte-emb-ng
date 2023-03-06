import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';
import { z } from 'zod';
import { saveExchangeRateSchema } from '$lib/validation/saveExchangeRate.validate';
import type { Prisma } from '@prisma/client';

export const exchangeRate = router({
  getExchangeRates: protectedProcedure.input(z.object({
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

    let query: Prisma.ExchangeRateFindManyArgs;

    const baseQuery = {
      include: {
        ExchangeRateDetails: true
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

    return await prisma.exchangeRate.findMany(query);
  }),
  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const exchangeRate = await prisma.exchangeRate.findUnique({
      where: {
        id: input
      },
      include: {
        ExchangeRateDetails: true
      }
    });

    return exchangeRate;
  }),
  getDefaultExchangeRate: protectedProcedure.query(async () => {
    const exchangeRate = await prisma.exchangeRate.findMany({
      where: {
        isDefault: {
          equals: true
        }
      },
      include: {
        ExchangeRateDetails: true
      }
    });

    if (exchangeRate.length > 1) {
      throw new Error("Default exchange rates are more than one");
    }

    return exchangeRate;
  }),
  saveOrUpdateExchangeRate: protectedProcedure.input(saveExchangeRateSchema).mutation(async ({ input, ctx }) => {

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

    const { ExchangeRateDetails, ...restRates } = input;

    const rateDetails = ExchangeRateDetails.map((list) => {
      const { id, ...restObj } = list;
      return {
        ...restObj,
      };
    });

    const data = {
      ...restRates,
      createdBy,
      ExchangeRateDetails: { createMany: { data: rateDetails } }
    }

    if (input.id) {
      return await prisma.exchangeRate.update({ where: { id: input.id }, data });
    } else {
      return await prisma.exchangeRate.create({ data });
    }

  }),

  deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    const exchangeRate = await prisma.exchangeRate.update({
      where: { id: input },
      data: { isActive: false }
    });

    return exchangeRate;
  })
});

export const changeCurrentDefault = async () => {
  return await prisma.exchangeRate.updateMany({
    where: {
      isDefault: {
        equals: true
      }
    },
    data: { isDefault: false }
  });
};