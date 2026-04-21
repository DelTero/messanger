export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    CHECK_AUTH: '/auth/check-auth',
  },

  // Пользователи
  USERS: {
    GET_ALL: '/users',
  },

  // VoIP
  VOIP: {
    ICE_SERVERS: '/voip/ice-servers',
  },

  // Уведомления
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    STREAM: '/notifications/stream',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/notifications/read-all',
  },
} as const;
