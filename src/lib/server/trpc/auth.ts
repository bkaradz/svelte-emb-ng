import prisma from '$lib/server/prisma';
import * as trpc from '@trpc/server';
import { z } from 'zod';

export default trpc
  .router()
  .query('browse', {
    input: z.string().optional(),
    resolve: ({ input }) =>
      prisma.contacts.findMany({})
  })
