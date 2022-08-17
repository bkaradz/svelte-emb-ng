import { json as json$1 } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit'
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
  email: z.string({required_error: "Email is required"}).email({message: "Not a valid email"}),
	password: z.string({required_error: "Address is required"}),
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

export const POST: RequestHandler = async ({ request }): Promise<{ status: number, headers?: any, body: { message: string } | { error: any } | SessionInterface }> => {
  try {
    // validate the user's password
    const reqUser: loginCredentials = await request.json()

    const parsedUser = loginCredentialsSchema.safeParse(reqUser)

    if (!parsedUser.success) {
      return json$1({
  error: parsedUser.error
}, {
        status: 400
      });
    }

    let user = await validateUserPassword(reqUser)

    if (!user) {
      return json$1({
  message: 'Invalid email or password',
}, {
        status: 401,
        headers: { 'Set-Cookie': '' }
      })
    }

    if (!user.isActive) {
      return json$1({
  message: 'Unauthorized',
}, {
        status: 403,
        headers: { 'Set-Cookie': '' }
      })
    }

     user = omit(JSON.parse(JSON.stringify(user)), ['password']) as Omit<ContactsDocument, 'password'>

    // create a session
    const session: SessionsDocument = await createSession(user._id, request.headers.get('user-agent') || '')

    // create an access token
    const accessToken = signJwt({ ...user, sessionID: session._id }, { expiresIn: config.get('accessTokenTtl') })

    // create a refresh token
    const refreshToken = signJwt({ ...user, sessionID: session._id }, { expiresIn: config.get('refreshTokenTtl') })

    const headers = setSessionCookies(accessToken, refreshToken)

    

    // return access & refresh tokens
    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return new Response({ ...user, sessionID: session._id, authenticated: true } as SessionInterface, { headers: headers });
    return {
      status: 200,
      headers,
      body: { ...user, sessionID: session._id, authenticated: true } as SessionInterface,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
  }
}
