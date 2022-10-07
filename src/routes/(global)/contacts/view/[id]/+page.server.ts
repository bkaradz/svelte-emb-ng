import prisma from '$lib/prisma/client';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  console.log("🚀 ~ file: +page.server.ts ~ line 6 ~ constload:PageServerLoad= ~ params", params)




  const res = await fetch('http://localhost:5173/api/orders.json?');
  const orders = await res.json();
  console.log("🚀 ~ file: +page.server.ts ~ line 14 ~ constload:PageServerLoad= ~ orders", orders)


  // const order = await prisma.orders.findMany({
  //   where: {
  //     customersID: parseInt(params.id)
  //   },
  //   include: {
  //     OrderLine: true,
  //   },
  // })
  // // console.log("🚀 ~ file: +page.server.ts ~ line 22 ~ constload:PageServerLoad= ~ order", order)

  // const orderNew = order.map((item) => {
  //   if (item?.orderDate) {
  //     item.orderDate = dayjs(item.orderDate).format('YYYY-MM-DDTHH:mm')
  //   }
  //   if (item?.deliveryDate) {
  //     item.deliveryDate = dayjs(item.deliveryDate).format('YYYY-MM-DDTHH:mm')
  //   }


  //   return item
  // })

  // const newLine = order?.OrderLine.map((item) => {
  //   const { Products, ...restLine } = item
  //   return { ...restLine, ...Products }
  // })

  // if (order?.OrderLine) {
  //   order.OrderLine = newLine
  // }

  return {
    orders
  };

};