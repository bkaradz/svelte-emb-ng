import { calculateOrder, type MainOrder } from '$lib/services/orders';

export const calculateCartPrisma = async (input: Partial<MainOrder>) => {
	const test = await calculateOrder(input);

	return test;
};
