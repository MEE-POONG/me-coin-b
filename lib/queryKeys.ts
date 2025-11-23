export const qk = {
  admins: {
    list: ['admins', 'list'] as const,
    detail: (id: string) => ['admins', 'detail', id] as const,
  },
  users: {
    list: ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
};
