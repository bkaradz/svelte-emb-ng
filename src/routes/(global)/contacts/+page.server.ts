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
    orderBy: {
      name: 'asc'
    },
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
    },
  };
  const queryTotal = {
    where: {
      isActive: true,
    },
  };

  const customersPromise = prisma.contacts.findMany(query);
  const totalRecordsPromise = prisma.contacts.count(queryTotal);

  const [customers, totalRecords] = await Promise.all([customersPromise, totalRecordsPromise]);

  pagination.totalRecords = totalRecords
  pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

  if (pagination.endIndex >= pagination.totalRecords) {
    pagination.next = undefined;
  }

  const newCustomers = { results: customers, ...pagination }

  return {
    customers: newCustomers,
  };

};