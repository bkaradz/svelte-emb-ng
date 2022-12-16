import { TRPCClientError } from "@trpc/client";
import logger from '$lib/utility/logger';
import { toasts } from '$lib/stores/toasts.store';


export const handleErrors = (err: any) => {
  if (err instanceof TRPCClientError) {
    logger.error(`Error: ${JSON.parse(err.message)}`);
  } else {
    logger.error(`Error: ${err}`);
  }
  toasts.add({
    message: 'An error occurred',
    type: 'error'
  });
}