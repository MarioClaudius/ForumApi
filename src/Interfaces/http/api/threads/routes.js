const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
      plugins: {
        'hapi-rate-limit': {
          enabled: true,
          userLimit: false,
          userPathLimit: false,
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
          enabled: true,
          userLimit: false,
          userPathLimit: false,
          pathLimit: 90,
          pathCache: {
            expiresIn: 60000,
          },
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/threadstest',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threadstest/{threadId}',
    handler: handler.getDetailThreadHandler,
  },
]);

module.exports = routes;
