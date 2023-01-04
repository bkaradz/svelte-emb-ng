import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';
import { calculateCartSchema } from '$lib/validation/cartCalculations.validate';
import { calculateOrder } from '$lib/services/orders';

export const cart = router({
  calculateCart: protectedProcedure.input(
    calculateCartSchema
  ).mutation(async ({ input }) => {
    return await calculateOrder(input);
  }),
});

