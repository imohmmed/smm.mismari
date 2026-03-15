module.exports = {
  apps: [
    {
      name: 'mismari',
      script: './dist/index.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/mismari/error.log',
      out_file: '/var/log/mismari/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
