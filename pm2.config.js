module.exports = {
    apps: [
        {
            name: '@oylik-bot',
            script: './dist/main.js',
            instances: 1, // Run only one instance (change for multi-core support)
            autorestart: true, // 🔥 Ensures restart on failure
            restart_delay: 5000, // 🔥 Delay of 5 seconds before restarting
            max_restarts: 10, // 🔥 Maximum restart attempts (prevents infinite loops)
            watch: false, // Change to true for dev mode (auto-restart on file changes)
            env: {
                NODE_ENV: 'development',
            },
        },
    ],
};
