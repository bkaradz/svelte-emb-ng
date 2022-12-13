import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'
import { getPagination } from '$lib/utility/pagination.util';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load: PageServerLoad = async (event) => {

  const contact = await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id));

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
      customersID: parseInt(event.params.id),
    },
  };
  const orderQueryTotal = {
    where: {
      isActive: true,
      customersID: parseInt(event.params.id),
    },
  };

  const ordersPromise = prisma.orders.findMany(ordersQuery);
  const totalRecordsPromise = prisma.orders.count(orderQueryTotal);

  const [orders, totalRecords] = await Promise.all([ordersPromise, totalRecordsPromise]);

  pagination.totalRecords = totalRecords
  pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

  if (pagination.endIndex >= pagination.totalRecords) {
    pagination.next = undefined;
  }

  const newOrders = { results: orders, ...pagination }

  return {
    customer: contact,
    orders: newOrders
  };

};