
import { authentication } from '$lib/trpc/routes/authentication';
import { cart } from '$lib/trpc/routes/cart';
import { contacts } from '$lib/trpc/routes/contacts';
import { exchangeRate } from '$lib/trpc/routes/exchangeRate';
import { options } from '$lib/trpc/routes/options';
import { orders } from '$lib/trpc/routes/orders';
import { paymentTypeOptions } from '$lib/trpc/routes/paymentTypeOptions';
import { pricelists } from '$lib/trpc/routes/pricelists';
import { products } from '$lib/trpc/routes/products';
import { test } from '$lib/trpc/routes/test';
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
  exchangeRate,
  cart,
  paymentTypeOptions
});

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;