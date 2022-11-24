import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'
import { getPagination } from '$lib/utility/pagination.util';

export const load: PageServerLoad = async ({ params }) => {

  const productBaseQuery = {};

  const productQuery = {
    ...productBaseQuery,
    where: {
      id: parseInt(params.id),
    },
  };

  const productPromise = prisma.products.findUnique(productQuery);

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
      productsID: parseInt(params.id),
    },
  };
  const orderQueryTotal = {
    where: {
      productsID: parseInt(params.id),
    },
  };

  const ordersPromise = prisma.orderLine.findMany(ordersQuery);
  const totalRecordsPromise = prisma.orderLine.count(orderQueryTotal);

  const [product, orders, totalRecords] = await Promise.all([productPromise, ordersPromise, totalRecordsPromise]);

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

};