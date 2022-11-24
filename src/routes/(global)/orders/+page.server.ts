import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'
import { getPagination } from '$lib/utility/pagination.util';

export const load: PageServerLoad = async ({ params }) => {

  const queryParams = {
    limit: 15,
    page: 1
  }

  const pagination = getPagination(queryParams);

  const baseQuery = {
    take: pagination.limit,
    skip: (pagination.page - 1) * pagination.limit,
    // orderBy: {
    //   id: 'asc'
    // },
    include: {
      customerContact: true,
      Pricelists: true
    }
  };

  const query = {
    ...baseQuery,
    where: {
      isActive: true,
    },
  };
  const queryTotal = {
    where: {
      isActive: true,
    },
  };

  const ordersPromise = prisma.orders.findMany(query);
  const totalRecordsPromise = prisma.orders.count(queryTotal);

  const [orders, totalRecords] = await Promise.all([ordersPromise, totalRecordsPromise]);

  pagination.totalRecords = totalRecords
  pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

  if (pagination.endIndex >= pagination.totalRecords) {
    pagination.next = undefined;
  }

  const newOrders = { results: orders, ...pagination }

  return {
    orders: newOrders,
  };

};