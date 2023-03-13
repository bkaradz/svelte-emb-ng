import { router } from '$lib/trpc/t';
import { calculateCartSchema } from '$lib/validation/cartCalculations.validate';
import type { SaveOrder } from '$lib/validation/saveOrder.validate';
import { protectedProcedure } from '../middleware/auth';
import { calculateCartPrisma } from './cart.prisma';

export const cart = router({
	calculateCart: protectedProcedure.input(calculateCartSchema).mutation(async ({ input }) => {
		return await calculateCartPrisma(input as Partial<SaveOrder>);
	})
});
