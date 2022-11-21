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

  const productsPromise = prisma.products.findMany(query);
  const totalRecordsPromise = prisma.products.count(queryTotal);

  const [products, totalRecords] = await Promise.all([productsPromise, totalRecordsPromise]);

  pagination.totalRecords = totalRecords
  pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

  if (pagination.endIndex >= pagination.totalRecords) {
    pagination.next = undefined;
  }

  const newProducts = { results: products, ...pagination }

  return {
    products: newProducts,
  };

};