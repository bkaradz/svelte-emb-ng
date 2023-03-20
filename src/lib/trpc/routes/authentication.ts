import { publicProcedure, router } from '$lib/trpc/t';
import { loginCredentialsSchema } from '$lib/validation/login.validate';
import { searchParamsSchema } from '$lib/validation/searchParams.validate';
import { editUserSchema, userRegisterSchema } from '$lib/validation/userRegister.validate';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';
import {
	deleteByIdPrisma,
	getByIdPrisma,
	getUsersPrisma,
	loginUserPrisma,
	registerOrUpdateUserPrisma,
	updateUserWithoutPasswordPrisma
} from './authentication.prisma';

export const authentication = router({
	getUsers: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input }) => {
		return await getUsersPrisma(input);
	}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getByIdPrisma(input);
	}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteByIdPrisma(input);
	}),
	registerOrUpdateUser: publicProcedure.input(userRegisterSchema).mutation(async ({ input }) => {
		return await registerOrUpdateUserPrisma(input);
	}),

	UpdateUserWithoutPassword: publicProcedure.input(editUserSchema).mutation(async ({ input }) => {
		return await updateUserWithoutPasswordPrisma(input);
	}),
	/**
	 * FIX: find the solution to authenticate using cookies with trpc
	 */
	loginUser: publicProcedure.input(loginCredentialsSchema).mutation(async ({ input, ctx }) => {
		return await loginUserPrisma(input, ctx);
	})
});
