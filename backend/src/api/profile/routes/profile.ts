/**
 * Self-service profile routes. Both require an authenticated user; the
 * controller only ever reads/writes the current user (ctx.state.user),
 * so a user can never touch someone else's profile.
 */
export default {
  routes: [
    { method: 'GET', path: '/profile', handler: 'profile.me', config: { policies: [] } },
    { method: 'PUT', path: '/profile', handler: 'profile.update', config: { policies: [] } },
  ],
};
