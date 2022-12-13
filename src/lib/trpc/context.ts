// lib/trpc/context.ts
import { findSessions } from '$lib/services/session.services';
import { verifyJwt } from '$lib/utility/jwt.utils';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
// import prisma from '$lib/prisma/client';

// we're not using the event parameter is this example,
// hence the eslint-disable rule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createContext(event: RequestEvent) {
  const cookies = event.cookies.get('accessToken');

  let decoded

  if (cookies) {
    decoded = verifyJwt(cookies).decoded;
  }

  if (decoded) {
    const session = await findSessions(decoded?.sessionID);
    if (session) {
      return { sessionId: decoded.sessionID }
    }
  }

  return {
    sessionId: null,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;