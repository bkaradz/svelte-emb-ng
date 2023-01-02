import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'
import { getPagination } from '$lib/utility/pagination.util';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const product = await router.createCaller(await createContext(event)).products.getById(parseInt(event.params.id));

  if (!product) {
    throw new Error("Product not found");
  }

  const queryParams = {
    limit: 15,
    page: 1
  }

  const pagination = getPagination(queryParams);


  const ordersBaseQuery = {
    take: pagination.limit,
    skip: (pagination.page - 1) * pagination.limit,
    include: {
      Orders: {
        include: {
          customerContact: true
        }
      },
    }
  };

  const ordersQuery = {
    ...ordersBaseQuery,
    where: {
      productsID: parseInt(event.params.id),
    },
  };
  const orderQueryTotal = {
    where: {
      productsID: parseInt(event.params.id),
    },
  };

  const ordersPromise = prisma.orderLine.findMany(ordersQuery);
  const totalRecordsPromise = prisma.orderLine.count(orderQueryTotal);

  const [orders, totalRecords] = await Promise.all([ordersPromise, totalRecordsPromise]);

  pagination.totalRecords = totalRecords
  pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

  if (pagination.endIndex >= pagination.totalRecords) {
    pagination.next = undefined;
  }

  const newOrders = { results: orders, ...pagination }

  return {
    product,
    orders: newOrders
  };

}) satisfies PageServerLoad;