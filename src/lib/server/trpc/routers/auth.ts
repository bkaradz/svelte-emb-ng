import Input from '$lib/components/Input.svelte';
import prisma from '$lib/server/prisma';
import * as trpc from '@trpc/server';
import { z } from 'zod';

export default trpc
	.router()
	.query('getUsers', {
		input: z.string().optional(),
		resolve: ({ input }) =>
			prisma.contacts.findMany({
				where: {
					isUser: {
						equals: true
					}
				}
			})
	})
	.query('getUserById', {
		input: z.number(),
		resolve: ({ input }) =>
			prisma.contacts.findUnique({
				where: {
					id: input
				}
			})
	})
	.mutation('deleteUser', {
		input: z.number(),
		resolve: ({ input }) =>
			prisma.contacts.update({
				where: {
					id: input
				},
				data: {
					isActive: false
				}
			})
	})
	.mutation('createUser', {
		input: z.number(),
		resolve: ({ input }) =>
			prisma.contacts.update({
				where: {
					id: input
				},
				data: {
					isActive: false
				}
			})
	});
