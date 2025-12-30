export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    CHECK_AUTH: '/auth/check-auth',
  },

  // Фитнес
  FITNESS: {
    GET_ALL: '/fitness/exercises',
    CREATE: '/fitness/exercises',
    APPROACHES: '/fitness/approaches',
  },

  // Пользователи
  USERS: {
    GET_ALL: '/users',
  },

  // VoIP
  VOIP: {
    ICE_SERVERS: '/voip/ice-servers',
  },
} as const;
