import type { Router } from '$lib/trpc/router';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';
import superjson from 'superjson';

let browserClient: ReturnType<typeof createTRPCClient<Router>>;

export function trpc(init?: TRPCClientInit) {
  if (typeof window === 'undefined') return createTRPCClient<Router>({ init });
  if (!browserClient) browserClient = createTRPCClient<Router>({
    transformer: superjson,
  });
  return browserClient;
}