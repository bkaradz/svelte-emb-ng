import type { RequestHandler } from '@sveltejs/kit'
import { deleteSessionCookies, deleteSessions } from '$lib/services/session.services'
import logger from '$lib/utility/logger'

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const sessionID = locals?.user?.sessionID

    const headers = deleteSessionCookies()

    if (!sessionID) {
      return {
        status: 404,
        headers,
        body: {
          message: 'Session not Found',
        },
      }
    }

    deleteSessions(sessionID)

    locals.user = {}

    return {
      status: 200,
      headers,
      body: {
        message: `You have successfully singed out`,
      },
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
