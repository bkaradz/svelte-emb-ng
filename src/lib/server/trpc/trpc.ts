import * as trpc from '@trpc/server';

export default trpc
  .router()
  // queries and mutations...
  .query('hello', {
    resolve: () => 'world',
  });

