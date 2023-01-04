import dayjs from 'dayjs';
import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {
  const embroideryTypes = await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryTypes' })

  const embroideryPositions = await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryPositions' })

  const queryParams = {
    limit: 7,
    page: 1,
  }

  const customers = await router.createCaller(await createContext(event)).contacts.getContacts(queryParams);

  const pricelists = await router.createCaller(await createContext(event)).pricelists.getPricelists({});

  const order = await router.createCaller(await createContext(event)).orders.getById(parseInt(event.params.id));

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
    order,
    embroideryTypes,
    embroideryPositions,
    customers,
    pricelists,
  };

}) satisfies PageServerLoad;
