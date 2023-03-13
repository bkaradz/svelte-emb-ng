import { calculateOrder } from '$lib/services/orders';
import type { SaveOrder } from '$lib/validation/saveOrder.validate';
import type { Prisma } from '@prisma/client';

export const calculateCartPrisma = async (input: Partial<SaveOrder>) => {
	const test = await calculateOrder(input);

	return test;
};

export type CalculateCart = typeof calculateCartPrisma;
export type CalculateCartReturn = Prisma.PromiseReturnType<typeof calculateCartPrisma>