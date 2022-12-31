
import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { getPagination } from '$lib/utility/pagination.util';
import omit from 'lodash-es/omit';
import { protectedProcedure } from '../middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { z } from 'zod';
import { saveOrdersSchema } from '$lib/validation/saveOrder.validate';
import normalizePhone from '$lib/utility/normalizePhone.util';
import type { Prisma } from '@prisma/client';

export const orders = router({
  getOrders: protectedProcedure
    .input(searchParamsSchema.passthrough())
    .query(async ({ input }) => {

      const pagination = getPagination(input);

      const finalQuery = omit(input, ['page', 'limit', 'sort']);

      const objectKeys = Object.keys(finalQuery)[0];

      let whereQuery;

      if (objectKeys === 'isCorporate' || objectKeys === 'isActive' || objectKeys === 'isUser') {
        whereQuery = {
          equals: finalQuery[objectKeys] === 'true'
        };
      } else {
        whereQuery = {
          contains: finalQuery[objectKeys],
          mode: 'insensitive'
        };
      }

      let query;
      let queryTotal;

      const baseQuery = {
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        include: {
          email: true,
          phone: true,
          address: true
        },
        orderBy: {
          name: 'asc'
        }
      };

      if (objectKeys) {
        query = {
          ...baseQuery,
          where: {
            isActive: true,
            [objectKeys]: whereQuery
          },
        };
        queryTotal = {
          where: {
            isActive: true,
            [objectKeys]: whereQuery
          }
        };
      } else {
        query = {
          ...baseQuery,
          where: {
            isActive: true,
          },
        };
        queryTotal = {
          where: {
            isActive: true,
          },
        };
      }

      const ordersQuery = await prisma.orders.findMany(query);
      pagination.totalRecords = await prisma.orders.count(queryTotal);
      pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

      if (pagination.endIndex >= pagination.totalRecords) {
        pagination.next = undefined;
      }

      return { results: ordersQuery, ...pagination }

    }),
  getCorporate: protectedProcedure
    .input(searchParamsSchema.passthrough())
    .query(async ({ input }) => {

      const pagination = getPagination(input);

      const baseQuery = {
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        include: {
          email: true,
          phone: true,
          address: true
        }
      };

      const query = {
        ...baseQuery,
        where: {
          isActive: true,
          isCorporate: true
        },
      };

      const queryTotal = {
        where: {
          isActive: true,
          isCorporate: true
        },
      };

      const ordersQuery = await prisma.orders.findMany(query);
      pagination.totalRecords = await prisma.orders.count(queryTotal);
      pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

      if (pagination.endIndex >= pagination.totalRecords) {
        pagination.next = undefined;
      }

      return { results: ordersQuery, ...pagination }

    }),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {

      const product = await prisma.orders.findUnique({
        where: {
          id: input
        },
        include: {
          email: true,
          phone: true,
          address: true
        }
      });

      return product

    }),
  deleteById: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const product = await prisma.orders.update({
        where: {
          id: input
        },
        data: { isActive: false }
      });
      return product
    }),

  SaveOrder: protectedProcedure
    .input(saveOrdersSchema)
    .mutation(async ({ input, ctx }) => {

      if (!ctx.userId) {
        throw new Error("User not found");
      }

      const ordersQuery = querySelection(input, ctx.userId);

      const order = await prisma.orders.create({ data: ordersQuery });

      return order
    }),
  updateOrder: protectedProcedure
    .input(saveOrdersSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User not found");
      }

      const ordersQuery = querySelection(input, ctx.userId);

      const order = await prisma.orders.update({
        where: {
          id: input.id
        },
        data: ordersQuery
      });

      return order
    }),
});


export const querySelection = (reqOrder: any, createDBy: number) => {
  let { name, email, phone, address, ...restOrder } = reqOrder;

  name = name.trim();
  if (email) {
    email = email.split(',').map((data: string) => {
      return { email: data.trim() };
    });
  }
  if (phone) {
    phone = normalizePhone(phone);
  }
  if (address) {
    address = address.split(',').map((data: string) => {
      return { address: data.trim() };
    });
  }

  let order: Prisma.OrdersCreateInput;

  order = {
    ...restOrder,
    name,
    createdBy: createDBy,
    isActive: true,
    isUser: false
  };

  if (email) {
    order = {
      ...order,
      email: { createMany: { data: email } }
    };
  }
  if (phone) {
    order = {
      ...order,
      phone: { createMany: { data: phone } }
    };
  }
  if (address) {
    order = {
      ...order,
      address: { createMany: { data: address } }
    };
  }
  if (email && phone) {
    order = {
      ...order,
      email: { createMany: { data: email } },
      phone: { createMany: { data: phone } }
    };
  }
  if (email && address) {
    order = {
      ...order,
      email: { createMany: { data: email } },
      address: { createMany: { data: address } }
    };
  }
  if (phone && address) {
    order = {
      ...order,
      phone: { createMany: { data: phone } },
      address: { createMany: { data: address } }
    };
  }
  if (email && phone && address) {
    order = {
      ...order,
      email: { createMany: { data: email } },
      phone: { createMany: { data: phone } },
      address: { createMany: { data: address } }
    };
  }

  return order;
};