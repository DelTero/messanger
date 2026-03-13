export const QUERY_KEYS = {
  FITNESS: {
    EXERCISES: 'exercises',
    EXERCISES_BY_USER_ID: (userId?: number) => ['exercises', userId],
    APPROACHES: 'approaches',
    APPROACHES_BY_EXERCISE_ID: (exerciseId?: string) => (exerciseId ? ['approaches', exerciseId] : ['approaches']),
  },
  NOTIFICATIONS: {
    ALL: ['notifications'],
  },
};
