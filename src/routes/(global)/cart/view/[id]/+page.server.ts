import prisma from '$lib/prisma/client';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {


  const order = await prisma.orders.findUnique({
    where: {
      id: parseInt(params.id)
    },
    include: {
      customerContact: true,
      Pricelists: true,
      OrderLine: {
        include: {
          Products: true
        }
      }
    },
  })

  if (order?.orderDate) {
    order.orderDate = dayjs(order.orderDate).format('YYYY-MM-DDTHH:mm')
  }
  if (order?.deliveryDate) {
    order.deliveryDate = dayjs(order.deliveryDate).format('YYYY-MM-DDTHH:mm')
  }
  const newLine = order?.OrderLine.map((item) => {
    const { Products, ...restLine } = item
    return { ...restLine, ...Products }
  })

  if (order?.OrderLine) {
    order.OrderLine = newLine
  }

  return {
    order
  };

}) satisfies PageServerLoad;
