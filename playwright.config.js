const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ testDir: './tests/browser', testMatch: '**/*.spec.js',
    fullyParallel: false, workers: 1, timeout: 30000, reporter: 'list',
    use: { headless: true, viewport: { width: 1440, height: 900 },
        channel: process.env.PW_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
        screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
