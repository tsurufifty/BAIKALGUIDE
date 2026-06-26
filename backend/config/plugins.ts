export default ({ env }) => ({
  i18n: {
    enabled: true,
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '7d'),
      },
      jwtSecret: env('JWT_SECRET'),
    },
  },
  upload: {
    config: {
      sizeLimit: env.int('UPLOAD_SIZE_LIMIT', 50 * 1024 * 1024),
      breakpoints: {
        xlarge: 1920,
        large: 1280,
        medium: 768,
        small: 480,
        thumbnail: 320,
      },
    },
  },
});
