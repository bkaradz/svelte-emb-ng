
import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { getPagination } from '$lib/utility/pagination.util';
import { saveProductsSchema } from '$lib/validation/saveProduct.validate';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import omit from 'lodash-es/omit';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';

export const products = router({
  getProducts: protectedProcedure
    .input(searchParamsSchema.passthrough())
    .query(async ({ input }) => {

      const pagination = getPagination(input);

      const finalQuery = omit(input, ['page', 'limit', 'sort']);

      const objectKeys = Object.keys(finalQuery)[0];

      let query: any;
      let queryTotal: any;

      const baseQuery = {
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        orderBy: {
          name: 'asc'
        }
      };

      if (objectKeys) {
        query = {
          ...baseQuery,
          where: {
            isActive: true,
            [objectKeys]: {
              contains: finalQuery[objectKeys],
              mode: 'insensitive'
            }
          }
        };
        queryTotal = {
          where: {
            isActive: true,
            [objectKeys]: {
              contains: finalQuery[objectKeys],
              mode: 'insensitive'
            }
          }
        };
      } else {
        query = {
          where: {
            isActive: true,
          },
          ...baseQuery
        };
        queryTotal = {
          where: {
            isActive: true,
          }
        };
      }

      const productsQuery = await prisma.products.findMany(query);

      pagination.totalRecords = await prisma.products.count(queryTotal);
      pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

      if (pagination.endIndex >= pagination.totalRecords) {
        pagination.next = undefined;
      }

      return { results: productsQuery, ...pagination }

    }),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {

      const product = await prisma.products.findUnique({
        where: {
          id: input
        }
      });

      return product

    }),
  deleteById: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const product = await prisma.products.update({
        where: {
          id: input
        },
        data: { isActive: false }
      });
      return product
    }),
  saveOrUpdateProducts: protectedProcedure.input(saveProductsSchema).mutation(async ({ input, ctx }) => {

    if (!ctx?.userId) {
      throw new Error("User not authorised");
    }

    const createdBy = ctx.userId as number;

    if (input.id) {
      return await prisma.products.update({
        where: {
          id: input.id
        },
        data: {
          ...input,
          createdBy
        }
      });
    } else {
      return await prisma.products.create({
        data: {
          ...input,
          createdBy
        }
      });
    }
  }),
});
