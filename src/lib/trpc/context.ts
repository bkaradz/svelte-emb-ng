// lib/trpc/context.ts
import { findSessions } from '$lib/services/session.services';
import { verifyJwt, type userSessionInterface } from '$lib/utility/jwt.utils';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';


export async function createContext(event: RequestEvent) {
  const cookies = event.cookies.get('accessToken');



  let decoded: userSessionInterface | null = null

  if (cookies) {
    decoded = verifyJwt(cookies).decoded as unknown as userSessionInterface;
  }

  if (decoded) {
    const session = await findSessions(decoded?.sessionID);
    if (session) {
      return { 
        sessionId: decoded.sessionID, 
        userId: decoded?.id,
        event
      }
    }
  }

  return {
    sessionId: null,
    userId: null,
    event
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;