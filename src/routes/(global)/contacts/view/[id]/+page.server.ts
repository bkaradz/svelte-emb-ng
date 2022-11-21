import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'
import { getPagination } from '$lib/utility/pagination.util';

export const load: PageServerLoad = async ({ params }) => {

  const customerBaseQuery = {
    include: {
      email: true,
      phone: true,
      address: true
    }
  };

  const customerQuery = {
    ...customerBaseQuery,
    where: {
      id: parseInt(params.id),
    },
  };

  const customerPromise = prisma.contacts.findUnique(customerQuery);

  const queryParams = {
    limit: 15,
    page: 1
  }

  const pagination = getPagination(queryParams);


  const ordersBaseQuery = {
    take: pagination.limit,
    skip: (pagination.page - 1) * pagination.limit,
    include: {
      Pricelists: true,
      OrderLine: {
        include: {
          Products: true
        }
      }
    }
  };

  const ordersQuery = {
    ...ordersBaseQuery,
    where: {
      isActive: true,
      customersID: parseInt(params.id),
    },
  };
  const orderQueryTotal = {
    where: {
      isActive: true,
      customersID: parseInt(params.id),
    },
  };

  const ordersPromise = prisma.orders.findMany(ordersQuery);
  const totalRecordsPromise = prisma.orders.count(orderQueryTotal);

  const [customer, orders, totalRecords] = await Promise.all([customerPromise, ordersPromise, totalRecordsPromise]);

  pagination.totalRecords = totalRecords
  pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

  if (pagination.endIndex >= pagination.totalRecords) {
    pagination.next = undefined;
  }

  const newOrders = { results: orders, ...pagination }

  return {
    customer,
    orders: newOrders
  };

};