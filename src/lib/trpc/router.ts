
import { test } from '$lib/trpc/routes/test';
import { products } from '$lib/trpc/routes/products';
import { contacts } from '$lib/trpc/routes/contacts';
import { options } from '$lib/trpc/routes/options';
import { authentication } from '$lib/trpc/routes/authentication';
import { orders } from '$lib/trpc/routes/orders';
import { pricelists } from '$lib/trpc/routes/pricelists';
import { xchangeRate } from '$lib/trpc/routes/xchangeRate';
import { cart } from '$lib/trpc/routes/cart';
import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const router = t.router({
  test,
  products,
  contacts,
  options,
  authentication,
  orders,
  pricelists,
  xchangeRate,
  cart
});

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;