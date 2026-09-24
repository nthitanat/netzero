const SystemService = require('../services/SystemService');
const { sendSuccess } = require('../middleware/response');

function getHealth(req, res) {
  return sendSuccess(res, {
    message: 'NetZero API Server is running',
    ...SystemService.getHealth()
  });
}

function getApiInfo(req, res) {
  const { apiPrefix, apiVersion, version } = SystemService.getApiInfo();
  const apiInfo = {
    version,
    documentation: {
      events: `${apiPrefix}/${apiVersion}/events`,
      connection: `${apiPrefix}/${apiVersion}/connection`,
      auth: `${apiPrefix}/${apiVersion}/auth`,
      users: `${apiPrefix}/${apiVersion}/users`,
      userEvents: `${apiPrefix}/${apiVersion}/user-events`,
      products: `${apiPrefix}/${apiVersion}/products`,
      reservations: `${apiPrefix}/${apiVersion}/reservations`,
      glocal: `${apiPrefix}/${apiVersion}/glocal`,
      health: '/health',
      apiInfo: '/'
    },
    endpoints: {
      connection: {
        test: `GET ${apiPrefix}/${apiVersion}/connection/test`,
        ping: `GET ${apiPrefix}/${apiVersion}/connection/ping`,
        database: `GET ${apiPrefix}/${apiVersion}/connection/database`,
        status: `GET ${apiPrefix}/${apiVersion}/connection/status`,
        echo: `GET|POST ${apiPrefix}/${apiVersion}/connection/echo`
      },
      events: {
        getAll: `GET ${apiPrefix}/${apiVersion}/events`,
        getById: `GET ${apiPrefix}/${apiVersion}/events/:id`,
        getByCategory: `GET ${apiPrefix}/${apiVersion}/events/category/:category`,
        getUpcoming: `GET ${apiPrefix}/${apiVersion}/events/upcoming`,
        search: `GET ${apiPrefix}/${apiVersion}/events/search?q=term`,
        getStatistics: `GET ${apiPrefix}/${apiVersion}/events/statistics`,
        create: `POST ${apiPrefix}/${apiVersion}/events`,
        update: `PUT ${apiPrefix}/${apiVersion}/events/:id`,
        softDelete: `PATCH ${apiPrefix}/${apiVersion}/events/:id/soft-delete`,
        updateParticipants: `PATCH ${apiPrefix}/${apiVersion}/events/:id/participants`,
        delete: `DELETE ${apiPrefix}/${apiVersion}/events/:id`
      },
      auth: {
        register: `POST ${apiPrefix}/${apiVersion}/auth/register`,
        login: `POST ${apiPrefix}/${apiVersion}/auth/login`,
        verify: `GET ${apiPrefix}/${apiVersion}/auth/verify`,
        refresh: `POST ${apiPrefix}/${apiVersion}/auth/refresh`,
        logout: `POST ${apiPrefix}/${apiVersion}/auth/logout`
      },
      users: {
        getCurrentUser: `GET ${apiPrefix}/${apiVersion}/users/me`,
        getAllUsers: `GET ${apiPrefix}/${apiVersion}/users (Admin only)`,
        getUserById: `GET ${apiPrefix}/${apiVersion}/users/:id (Owner or Admin)`,
        updateUser: `PUT ${apiPrefix}/${apiVersion}/users/:id (Owner or Admin)`,
        updatePassword: `PUT ${apiPrefix}/${apiVersion}/users/:id/password (Owner or Admin)`,
        deleteUser: `DELETE ${apiPrefix}/${apiVersion}/users/:id (Owner or Admin)`
      },
      userEvents: {
        getUserEvents: `GET ${apiPrefix}/${apiVersion}/user-events/user/:userId/events`,
        getMyEvents: `GET ${apiPrefix}/${apiVersion}/user-events/my-events (Auth required)`,
        joinEvent: `POST ${apiPrefix}/${apiVersion}/user-events/join (Auth required)`,
        leaveEvent: `DELETE ${apiPrefix}/${apiVersion}/user-events/user/:userId/event/:eventId (Auth required)`,
        getEventUsers: `GET ${apiPrefix}/${apiVersion}/user-events/event/:eventId/users`,
        checkOwnership: `GET ${apiPrefix}/${apiVersion}/user-events/user/:userId/event/:eventId/ownership`
      },
      products: {
        getAll: `GET ${apiPrefix}/${apiVersion}/products`,
        getById: `GET ${apiPrefix}/${apiVersion}/products/:id`,
        getByType: `GET ${apiPrefix}/${apiVersion}/products/type/:type`,
        getRecommended: `GET ${apiPrefix}/${apiVersion}/products/recommended`,
        search: `GET ${apiPrefix}/${apiVersion}/products/search/:searchTerm`,
        getMy: `GET ${apiPrefix}/${apiVersion}/products/my (Auth required)`,
        create: `POST ${apiPrefix}/${apiVersion}/products (Auth required)`,
        update: `PUT ${apiPrefix}/${apiVersion}/products/:id (Owner or Admin)`,
        delete: `DELETE ${apiPrefix}/${apiVersion}/products/:id (Owner or Admin)`,
        uploadThumbnail: `POST ${apiPrefix}/${apiVersion}/products/:id/upload/thumbnail (Owner or Admin)`,
        uploadCover: `POST ${apiPrefix}/${apiVersion}/products/:id/upload/cover (Owner or Admin)`,
        uploadImages: `POST ${apiPrefix}/${apiVersion}/products/:id/upload/images (Owner or Admin)`
      },
      reservations: {
        getAll: `GET ${apiPrefix}/${apiVersion}/reservations (Auth required)`,
        getById: `GET ${apiPrefix}/${apiVersion}/reservations/:id (Auth required)`,
        getMy: `GET ${apiPrefix}/${apiVersion}/reservations/my (Auth required)`,
        getMyProducts: `GET ${apiPrefix}/${apiVersion}/reservations/my-products (Auth required)`,
        getStats: `GET ${apiPrefix}/${apiVersion}/reservations/stats (Auth required)`,
        create: `POST ${apiPrefix}/${apiVersion}/reservations (Auth required)`,
        update: `PUT ${apiPrefix}/${apiVersion}/reservations/:id (Auth required)`,
        delete: `DELETE ${apiPrefix}/${apiVersion}/reservations/:id (Auth required)`,
        confirm: `POST ${apiPrefix}/${apiVersion}/reservations/:id/confirm (Product Owner)`,
        cancel: `POST ${apiPrefix}/${apiVersion}/reservations/:id/cancel (Auth required)`,
        updateStatus: `PUT ${apiPrefix}/${apiVersion}/reservations/:id/status (Product Owner)`
      },
      glocal: {
        verifyCheckin: `POST ${apiPrefix}/${apiVersion}/glocal/survey-checkins/verify`,
        getAll: `GET ${apiPrefix}/${apiVersion}/glocal/survey-checkins (Admin only)`,
        getById: `GET ${apiPrefix}/${apiVersion}/glocal/survey-checkins/:id (Admin only)`,
        create: `POST ${apiPrefix}/${apiVersion}/glocal/survey-checkins (Admin only)`,
        update: `PATCH ${apiPrefix}/${apiVersion}/glocal/survey-checkins/:id (Admin only)`,
        delete: `DELETE ${apiPrefix}/${apiVersion}/glocal/survey-checkins/:id (Admin only)`,
        webhook: `POST ${apiPrefix}/${apiVersion}/glocal/webhooks/surveymonkey (SurveyMonkey shared-secret auth)`
      }
    },
  };
  return sendSuccess(res, { message: 'Welcome to NetZero API', ...apiInfo });
}

async function checkDatabase(req, res) {
  const database = await SystemService.checkDatabase();
  return sendSuccess(res, { message: 'Database connection successful', database });
}

module.exports = { getHealth, getApiInfo, checkDatabase };
