const app = require('./src/app');
const logger = require('./src/shared/logger');

app.listen(8080, () => logger.info('app is running. port: 8080'));
