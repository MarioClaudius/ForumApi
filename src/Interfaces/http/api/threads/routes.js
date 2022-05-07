const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
      plugins: {
        'hapi-rate-limit': {
          pathLimit: 90,
          pathCache: {
            expiresIn: 60000,
          },
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getDetailThreadHandler,
    options: {
      plugins: {
        'hapi-rate-limit': {
          pathLimit: 90,
          pathCache: {
            expiresIn: 60000,
          },
        },
      },
    },
  },
]);

module.exports = routes;
