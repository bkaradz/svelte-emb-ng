import { rest } from 'msw'

// Mock Data
export const posts = [
  {
    createDBy: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body'
  },
  {
    createDBy: 2,
    id: 5,
    title: 'second post title',
    body: 'second post body'
  },
  {
    createDBy: 3,
    id: 6,
    title: 'third post title',
    body: 'third post body'
  }
]

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  rest.get('https://jsonplaceholder.typicode.com/posts', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(posts))
  })
]
