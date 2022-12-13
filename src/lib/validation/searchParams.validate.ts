import { z } from 'zod';

export const searchParamsSchema = z
  .object({
    limit: z.number().optional(),
    page: z.number().optional(),
    sort: z.string().optional(),
  })


export type searchParams = z.infer<typeof searchParamsSchema>;
export type searchParamsSchemaKeys = keyof searchParams;