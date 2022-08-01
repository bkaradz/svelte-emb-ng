import type { RequestHandler } from '@sveltejs/kit'
import { signJwt } from '$lib/utility/jwt.utils'
import config from 'config'
import logger from '$lib/utility/logger'
import type { ContactsDocument } from '$lib/models/contacts.model'
import { setSessionCookies, createSession, validateUserPassword } from '$lib/services/session.services'
import { z } from "zod";
import type { SessionsDocument } from '$lib/models/sessions.model'

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}).strict()

export type loginCredentials = z.infer<typeof loginCredentialsSchema>

export interface SessionInterface extends Omit<ContactsDocument, 'password'> {
  sessionID: SessionsDocument['_id'];
  authenticated: boolean;
}

export const POST: RequestHandler = async ({ request }): Promise<{ status: number, headers?: {}, body: { message: string } | SessionInterface | { error: any } }> => {
  try {
    // validate the user's password
    const reqUser: loginCredentials = await request.json()

    const parsedUser = loginCredentialsSchema.safeParse(reqUser)

    if (!parsedUser.success) {
      return {
        status: 400,
        body: {
          error: parsedUser.error
        }
      };
    }

    const user = (await validateUserPassword(reqUser))

    if (!user) {
      return {
        status: 401,
        headers: { 'Set-Cookie': '' },
        body: {
          message: 'Invalid email or password',
        },
      }
    }

    if (!user.isActive) {
      return {
        status: 403,
        headers: { 'Set-Cookie': '' },
        body: {
          message: 'Unauthorized',
        },
      }
    }

    // create a session
    const session: SessionsDocument = await createSession(user._id, request.headers.get('user-agent') || '')

    // create an access token
    const accessToken = signJwt({ ...user, sessionID: session._id }, { expiresIn: config.get('accessTokenTtl') })

    // create a refresh token
    const refreshToken = signJwt({ ...user, sessionID: session._id }, { expiresIn: config.get('refreshTokenTtl') })

    const headers = setSessionCookies(accessToken, refreshToken)


    // return access & refresh tokens
    return {
      status: 200,
      headers,
      body: { ...user, sessionID: session._id, authenticated: true },
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
}
