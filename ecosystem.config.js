export default {
  apps: [{
    name: 'aws-proxy',
    script: 'server/index.mjs',
    watch: ['server'],
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    autorestart: true,
    max_memory_restart: '1G',
  }]
}; 