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


  const customersPromise = await prisma.contacts.findMany(query);

  const [customers] = await Promise.all([customersPromise]);

  const newCustomers = { results: customers, ...pagination }

  return {
    customers: newCustomers,
  };

};