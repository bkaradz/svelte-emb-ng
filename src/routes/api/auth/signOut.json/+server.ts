import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types'
import { deleteSessionCookies, deleteSessions } from '$lib/services/session.services'
import logger from '$lib/utility/logger'

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const sessionID = locals?.user?.sessionID

    const headers = deleteSessionCookies()

    if (!sessionID) {
      return json({
        message: 'Session not Found',
      }, {
        status: 404,
        headers: headers
      })
    }

    deleteSessions(sessionID)

    locals.user = null

    return json({
      message: `You have successfully singed out`,
    }, {
      headers: headers
    })
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json({
      status: 500,
      errors: { message: `A server error occurred ${err}` },
    })
  }
}
