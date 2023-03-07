import { calculateOrder } from '$lib/services/orders';
import { router } from '$lib/trpc/t';
import { calculateCartSchema } from '$lib/validation/cartCalculations.validate';
import { protectedProcedure } from '../middleware/auth';

export const cart = router({
  calculateCart: protectedProcedure.input(
    calculateCartSchema
  ).mutation(async ({ input }) => {
    return await calculateOrder(input);
  }),
});

