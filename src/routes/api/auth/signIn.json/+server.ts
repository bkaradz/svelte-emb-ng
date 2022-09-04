import { json as json$1 } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signJwt } from '$lib/utility/jwt.utils'
import config from 'config'
import logger from '$lib/utility/logger'
import { setSessionCookies, createSession, validateUserPassword } from '$lib/services/session.services'
import { z } from "zod";
import type { SessionsDocument } from '$lib/models/sessions.model'
import omit from 'lodash-es/omit'
import type { Schema } from 'mongoose'
import prisma from '$lib/prisma/client';

export const loginCredentialsSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Not a valid email" }),
  password: z.string({ required_error: "Address is required" }),
}).strict()

export type loginCredentials = z.infer<typeof loginCredentialsSchema>

export interface SessionInterface {
  id: Schema.Types.ObjectId;
  name: string;
  isCorporate: boolean;
  email: string;
  isActive: boolean;
  isUser: boolean;
  userRole: string;
  sessionID: SessionsDocument['id'];
  authenticated: boolean;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // validate the user's password
    const reqUser: loginCredentials = await request.json()

    const parsedUser = loginCredentialsSchema.safeParse(reqUser)

    if (!parsedUser.success) {
      return new Response(JSON.stringify({ message: parsedUser.error }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 400
      });
    }

    let user = await validateUserPassword(reqUser)

    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    if (!user.isActive) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 403
      });
    }

    console.log("🚀 ~ file: +server.ts ~ line 80 ~ constPOST:RequestHandler= ~ user", user)

    // create a session
    const session = await createSession(user.id, request.headers.get('user-agent') || '')

    const body = { ...user, sessionID: session.id, authenticated: true }

    locals.user = body

    // create an access token
    const accessToken = signJwt(body, { expiresIn: config.get('accessTokenTtl') })

    // create a refresh token
    const refreshToken = signJwt(body, { expiresIn: config.get('refreshTokenTtl') })

    // return access & refresh tokens
    const headers = setSessionCookies(accessToken, refreshToken)

    return new Response(JSON.stringify(body), { headers: headers });

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      status: 500
    });
  }
}
