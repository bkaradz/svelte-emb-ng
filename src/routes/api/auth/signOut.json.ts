import type { RequestHandler } from '@sveltejs/kit'
import { deleteSessionCookies, deleteSessions } from '$lib/services/session.services'
import logger from '$lib/utility/logger'

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const sessionId = locals?.user?.sessionId
    const name = locals?.user?.name

    const headers = deleteSessionCookies()

    if (!sessionId) {
      return {
        status: 404,
        headers,
        body: {
          message: 'Session not Found',
        },
      }
    }

    deleteSessions(sessionId)

    locals.user = {}

    return {
      status: 200,
      headers,
      body: {
        message: `${name} has successfully singed out`,
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
