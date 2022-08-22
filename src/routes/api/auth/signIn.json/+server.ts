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
import type { ContactsDocument } from '$lib/models/contacts.model'

export const loginCredentialsSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Not a valid email" }),
  password: z.string({ required_error: "Address is required" }),
}).strict()

export type loginCredentials = z.infer<typeof loginCredentialsSchema>

export interface SessionInterface {
  _id: Schema.Types.ObjectId;
  name: string;
  isCorporate: boolean;
  email: string;
  isActive: boolean;
  isUser: boolean;
  userRole: string;
  sessionID: SessionsDocument['_id'];
  authenticated: boolean;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // validate the user's password
    const reqUser: loginCredentials = await request.json()

    const parsedUser = loginCredentialsSchema.safeParse(reqUser)

    if (!parsedUser.success) {
      return json$1({
        status: 400,
        errors: { message: parsedUser.error }
      });
    }

    let user = await validateUserPassword(reqUser)

    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'status': '401'
        }
      });
    }

    if (!user.isActive) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'status': '403'
        }
      });
    }

    user = omit(JSON.parse(JSON.stringify(user)), ['password']) as Omit<ContactsDocument, 'password'>

    // create a session
    const session: SessionsDocument = await createSession(user._id, request.headers.get('user-agent') || '')

    const body = { ...user, sessionID: session._id, authenticated: true } //as SessionInterface

    locals.user = body

    // create an access token
    const accessToken = signJwt(body, { expiresIn: config.get('accessTokenTtl') })

    // create a refresh token
    const refreshToken = signJwt(body, { expiresIn: config.get('refreshTokenTtl') })

    // return access & refresh tokens
    const headers = setSessionCookies(accessToken, refreshToken)

    return new Response(JSON.stringify(body), { headers });

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` },
    })
  }
}
