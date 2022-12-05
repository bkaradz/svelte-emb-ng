import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const queryParams = {
    limit: 3,
    page: 1,
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
      isCorporate: true
    },
  };

  const baseContactQuery = {
    include: {
      email: true,
      phone: true,
      address: true
    }
  };

  const contactQuery = {
    ...baseContactQuery,
    where: {
      id: parseInt(params.id),
    },
  };

  const corporatePromise = await prisma.contacts.findMany(query);
  const contactPromise = await prisma.contacts.findUnique(contactQuery);

  const [resCorporateContacts, contact] = await Promise.all([corporatePromise, contactPromise]);

  if (Array.isArray(contact?.email)) {
    contact.email = contact?.email.join(', ')
  }

  if (Array.isArray(contact?.phone)) {
    contact.phone = contact.phone.map((p) => p.phone)
    contact.phone = contact.phone.join(', ')
  }

  const corporateContacts = { results: resCorporateContacts, ...pagination }

  return {
    corporateContacts,
    contact
  };
};