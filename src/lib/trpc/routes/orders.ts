
import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { getPagination } from '$lib/utility/pagination.util';
import omit from 'lodash-es/omit';
import { protectedProcedure } from '../middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { z } from 'zod';
import { saveOrdersSchema } from '$lib/validation/saveOrder.validate';
import type { Prisma } from '@prisma/client';
import { calculateOrder } from '$lib/services/orders';
import pick from 'lodash-es/pick';

export const orders = router({
  getOrders: protectedProcedure
    .input(searchParamsSchema.passthrough())
    .query(async ({ input }) => {

      const pagination = getPagination(input);

      const finalQuery = omit(input, ['page', 'limit', 'sort']);

      const objectKeys = Object.keys(finalQuery)[0];

      let query: Prisma.OrdersFindFirstArgs;
      let queryTotal: Prisma.OrdersFindFirstArgs;

      const baseQuery = {
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        include: {
          customerContact: {
            include: {
              address: true
            }
          },
          Pricelists: true,
          OrderLine: {
            include: {
              Products: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      };

      if (objectKeys) {
        query = {
          ...baseQuery,
          where: {
            isActive: true,
            [objectKeys]: getOrdersQueryOptions(objectKeys, finalQuery)
          }
        };
        queryTotal = {
          where: {
            isActive: true,
            [objectKeys]: getOrdersQueryOptions(objectKeys, finalQuery)
          }
        };
      } else {
        query = {
          where: {
            isActive: true
          },
          ...baseQuery
        };
        queryTotal = {
          where: {
            isActive: true
          }
        };
      }

      const orderQuery = await prisma.orders.findMany(query);

      pagination.totalRecords = await prisma.orders.count(queryTotal);
      pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

      if (pagination.endIndex >= pagination.totalRecords) {
        pagination.next = undefined;
      }

      return { results: orderQuery, ...pagination };

    }),
  getOrderLine: protectedProcedure
    .input(searchParamsSchema.passthrough())
    .query(async ({ input }) => {

      const pagination = getPagination(input);

      const finalQuery = omit(input, ['page', 'limit', 'sort']);

      const objectKeys = Object.keys(finalQuery)[0];

      let query: Prisma.OrderLineFindManyArgs;
      let queryTotal: Prisma.OrderLineFindManyArgs;

      const baseQuery = {
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        include: {
          Orders: {
            include: {
              customerContact: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      };

      if (objectKeys) {
        query = {
          ...baseQuery,
          where: {
            [objectKeys]: getOrderLineQueryOptions(objectKeys, finalQuery)
          }
        };
        queryTotal = {
          where: {
            [objectKeys]: getOrderLineQueryOptions(objectKeys, finalQuery)
          }
        };
      } else {
        query = {
          ...baseQuery
        };
        queryTotal = {};
      }

      const productsQuery = await prisma.orderLine.findMany(query);

      pagination.totalRecords = await prisma.orderLine.count(queryTotal);
      pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

      if (pagination.endIndex >= pagination.totalRecords) {
        pagination.next = undefined;
      }

      return { results: productsQuery, ...pagination };

    }),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {

      const product = await prisma.orders.findUnique({
        where: {
          id: input
        },
        include: {
          customerContact: true,
          Pricelists: true,
          OrderLine: {
            include: {
              Products: true
            }
          }
        },
      });

      return product

    }),
  deleteById: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const order = await prisma.orders.update({
        where: {
          id: input
        },
        data: { isActive: false }
      });
      return order
    }),

  SaveOrderOrUpdate: protectedProcedure
    .input(saveOrdersSchema)
    .mutation(async ({ input, ctx }) => {

      if (!ctx.userId) {
        throw new Error("Unauthorised");
      }

      const createdBy = ctx.userId;

      // check that the pricelist exist
      const pricelist = await prisma.pricelists.findUnique({
        where: {
          id: input.pricelistsID
        }
      });

      if (!pricelist) {
        throw new Error('Pricelist does not exist')
      }

      // check that the customer exist
      // const customerExist = await ContactsModel.exists({ id: reqOrder.customerID });
      const customerExist = await prisma.contacts.findUnique({
        where: {
          id: input.customersID
        }
      });

      if (!customerExist) {
        throw new Error('Customer does not exist')
      }

      let calcOrder = await calculateOrder(input);

      calcOrder = calcOrder.map((item) =>
        pick(item, [
          'productsID',
          'unitPrice',
          'quantity',
          'total',
          'productCategories',
          'embroideryPositions',
          'embroideryTypes'
        ])
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { orderLine, ...restOrder } = input;

      if (restOrder?.orderDate) {
        restOrder.orderDate = new Date(restOrder.orderDate);
      }

      if (restOrder?.deliveryDate) {
        restOrder.deliveryDate = new Date(restOrder.deliveryDate);
      }

      if (restOrder.id) {
        delete restOrder.customerContact
        delete restOrder.Pricelists
        return await prisma.orders.update({
          where: {
            id: restOrder.id
          },
          data: {
            ...restOrder,
            createdBy,
            OrderLine: {
              updateMany: { data: calcOrder }
            }
          }
        });
      } else {
        return await prisma.orders.create({
          data: {
            ...restOrder,
            createdBy,
            OrderLine: {
              createMany: { data: calcOrder }
            }
          }
        });
      }
    }),
});

const getOrdersQueryOptions = (objectKeys: string, finalQuery) => {
  if (
    objectKeys === 'isCorporate' ||
    objectKeys === 'isActive' ||
    objectKeys === 'isUser' ||
    objectKeys === 'isInvoiced'
  ) {
    return {
      equals: finalQuery[objectKeys] === 'true'
    };
  }

  if (objectKeys === 'id' || objectKeys === 'customersID' || objectKeys === 'pricelistsID') {
    return parseInt(finalQuery[objectKeys]);
  }

  return {
    contains: finalQuery[objectKeys],
    mode: 'insensitive'
  };
};

const getOrderLineQueryOptions = (objectKeys: string, finalQuery) => {
  if (objectKeys === 'id' || objectKeys === 'ordersID' || objectKeys === 'productsID') {
    return parseInt(finalQuery[objectKeys]);
  }

  return {
    contains: finalQuery[objectKeys],
    mode: 'insensitive'
  };
};

