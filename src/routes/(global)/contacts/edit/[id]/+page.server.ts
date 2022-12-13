import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load: PageServerLoad = async (event) => {

  const queryParams = {
    limit: 5,
    page: 1,
  }

  const contacts = await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id));
  const corporate = await router.createCaller(await createContext(event)).contacts.getCorporate(queryParams);

 

  // const pagination = getPagination(queryParams);

  // const baseQuery = {
  //   take: pagination.limit,
  //   skip: (pagination.page - 1) * pagination.limit,
  //   include: {
  //     email: true,
  //     phone: true,
  //     address: true
  //   }
  // };

  // const query = {
  //   ...baseQuery,
  //   where: {
  //     isActive: true,
  //     isCorporate: true
  //   },
  // };

  // const baseContactQuery = {
  //   include: {
  //     email: true,
  //     phone: true,
  //     address: true
  //   }
  // };

  // const contactQuery = {
  //   ...baseContactQuery,
  //   where: {
  //     id: parseInt(event.params.id),
  //   },
  // };

  // const corporatePromise = await prisma.contacts.findMany(query);
  // const contactPromise = await prisma.contacts.findUnique(contactQuery);

  // const [resCorporateContacts, contact] = await Promise.all([corporatePromise, contactPromise]);

  // const corporateContacts = { results: resCorporateContacts, ...pagination }

  return {
    corporateContacts: corporate,
    contact: contacts
  };
};