import type { RequestHandler } from '@sveltejs/kit'
import { signJwt } from '$lib/utility/jwt.utils'
import config from 'config'
import logger from '$lib/utility/logger'
import { postSuite } from '$lib/validation/server/session.validate'
import type { ContactsDocument } from '$lib/models/contacts.model'
import { setSessionCookies, createSession, validateSessionPassword } from '$lib/services/session.services'

export interface signInRequestInterface {
  email: string
  password: string
}

export type signedInUserInterface = Pick<ContactsDocument, '_id' | 'id' | 'name' | 'email' | 'isUser' | 'isCorporate' | 'isActive' | 'userRole'>

export const POST: RequestHandler = async ({ request }): Promise<unknown> => {
  try {
    // validate the user's password
    const reqUser: signInRequestInterface = await request.json()

    const result = postSuite(reqUser)

    if (result.hasErrors()) {
      return {
        status: 400,
        body: {
          message: result.getErrors(),
        },
      }
    }

    const user = (await validateSessionPassword(reqUser)) as signedInUserInterface | false

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

    // delete all sessions by current user
    // deleteAllSessionByUserID(user._id);

    // create a session
    const session = await createSession(user._id, request.headers.get('user-agent') || '')

    // create an access token
    const accessToken = signJwt({ ...user, sessionId: session._id }, { expiresIn: config.get('accessTokenTtl') })

    // create a refresh token
    const refreshToken = signJwt({ ...user, sessionId: session._id }, { expiresIn: config.get('refreshTokenTtl') })

    const headers = setSessionCookies(accessToken, refreshToken)

    // return access & refresh tokens
    return {
      status: 200,
      headers,
      body: {
        user: { ...user, sessionId: session._id, authenticated: true },
      },
    }
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
}

/**
 * TODO: Refactor to remove session
 * Session GET
 */
// export const GET: RequestHandler = async ({ locals }): Promise<unknown> => {
// 	try {
// 		const userId = lodashGet(locals.user, '_id', null);

// 		if (!userId) {
// 			return {
// 				status: 403,
// 				body: {
// 					message: `Sessions User not Found`
// 				}
// 			};
// 		}

// 		const sessionsFound = await findSessions({ user: userId, valid: true });

// 		if (!sessionsFound) {
// 			return {
// 				status: 403,
// 				body: {
// 					message: `Sessions not Found`
// 				}
// 			};
// 		}

// 		return {
// 			status: 200,
// 			body: {
// 				message: sessionsFound
// 			}
// 		};
// 	} catch (err) {
// 		logger.error(err.message);
// 		return {
// 			status: 500,
// 			body: {
// 				error: `A server error occurred ${err}`
// 			}
// 		};
// 	}
// };

// /**
//  * Session DELETE
//  */
// export const DELETE: RequestHandler = async ({ locals }): Promise<unknown> => {
// 	const sessionId = locals.user.sessionId;

// 	if (sessionId) {
// 		deleteSessions(sessionId);
// 	}

// 	locals.user = {};

// 	const headers = deleteSessionCookies();

// 	return {
// 		status: 200,
// 		headers,
// 		body: {
// 			ok: true
// 		}
// 	};
// };

// async function deleteSessions(query: FilterQuery<SessionsDocument>) {
// 	return await SessionsModel.findByIdAndDelete(query);
// }
