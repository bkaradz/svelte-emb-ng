import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  console.log("🚀 ~ file: +page.server.ts ~ line 6 ~ constload:PageServerLoad= ~ params", params)

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

  const ordersBaseQuery = {
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
      customersID: parseInt(params.id),
    },
  };


  const customerPromise = await prisma.contacts.findUnique(customerQuery);
  const ordersPromise = await prisma.orders.findMany(ordersQuery);

  const [customer, orders] = await Promise.all([customerPromise, ordersPromise]);

  return {
    customer,
    orders
  };

};