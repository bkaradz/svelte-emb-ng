import type { MainOrder } from '$lib/services/orders';
import { router } from '$lib/trpc/t';
import { calculateCartSchema } from '$lib/validation/cartCalculations.validate';
import { protectedProcedure } from '../middleware/auth';
import { calculateCartPrisma } from './cart.prisma';

export const cart = router({
	calculateCart: protectedProcedure.input(calculateCartSchema).mutation(async ({ input }) => {
		return await calculateCartPrisma(input as Partial<MainOrder>);
	})
});
