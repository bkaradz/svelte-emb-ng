import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { saveOptionsSchema } from '$lib/validation/saveOption.validate';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';

export const options = router({
  getOptions: protectedProcedure.input(z.object({
    group: z.string().optional()
  })).query(async ({ input }) => {

    type ObjectKeys = keyof typeof input

    const objectKeys = Object.keys(input)[0] as ObjectKeys;

    let query: Prisma.OptionsFindManyArgs;

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
          label: 'asc'
        }
      };
    } else {
      query = {
        where: {
          isActive: true
        },
        orderBy: {
          label: 'asc'
        }
      };
    }

    return await prisma.options.findMany(query);
  }),
  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const option = await prisma.options.findUnique({
      where: {
        id: input
      }
    });

    return option;
  }),
  saveOrUpdateOption: protectedProcedure.input(saveOptionsSchema).mutation(async ({ input, ctx }) => {

    if (!ctx?.userId) {
      throw new Error("User not authorised");
    }

    const createdBy = ctx.userId as number;

    if (input.isDefault) {
      changeCurrentDefault(input.group);
    }

    const option = { ...input, createdBy, };

    if (input.id) {
      return await prisma.options.update({ where: { id: input.id }, data: option });
    } else {
      return await prisma.options.create({ data: option });
    }

  }),
  deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    const option = await prisma.options.update({
      where: { id: input },
      data: { isActive: false }
    });

    return option;
  })
});

export const changeCurrentDefault = async (group: string) => {
  await prisma.options.updateMany({
    where: {
      group,
      isDefault: {
        equals: true
      }
    },
    data: { isDefault: false }
  });
};