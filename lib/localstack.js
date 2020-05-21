const path = require('path');
const http = require('http');
const ora = require('ora');
const child_process = require('child_process');

const composeFileLocation = path.resolve(`${__dirname}/../docker-compose.yml`);

const execOptions = {
  stdio: ['ignore', 'ignore', 'ignore'],
};

const startLocalstack = ({ timeout = 1000 * 60, interval = 1000 } = {}) => {
  const spinner = ora('Starting Localstack').start();

  child_process.execSync(
    `TMPDIR=/private$TMPDIR docker-compose --log-level ERROR -f ${composeFileLocation} up -d localstack`,
    execOptions
  );

  const timeoutAt = Number(new Date()) + timeout;

  spinner.text = 'Localstack is starting...';

  return new Promise((resolve, reject) => {
    const waitOn = setInterval(() => {
      http
        .get('http://localhost:8080/health', (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            if (res.statusCode === 200) {
              const { services } = JSON.parse(body);

              if (!services) {
                return;
              }

              const notReady = Object.entries(services).filter(
                ([name, state]) => {
                  return name !== 'edge' && state !== 'running';
                }
              );

              const totalServices = Object.keys(services).length;

              const numReady = totalServices - notReady.length;

              spinner.text = `${numReady} / ${totalServices} services ready`;

              if (notReady.length === 0) {
                spinner.succeed('Localstack started');
                clearInterval(waitOn);
                resolve(true);
              }

              if (Number(new Date()) > timeoutAt) {
                reject(new Error(`Localstack failed, body:\n${body}`));
              }
            }
          });
        })
        .on('error', (err) => {
          if (err.code !== 'ECONNRESET') {
            reject(err);
          }
        });
    }, interval);
  });
};

const stopLocalstack = () => {
  child_process.execSync(
    `docker-compose -f ${composeFileLocation} stop localstack`,
    execOptions
  );
};

module.exports = {
  startLocalstack,
  stopLocalstack,
};
