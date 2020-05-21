const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const { exitHooks } = require('./hooks');
const { uploadDirectory } = require('./s3');

const createInjectedHandlerFile = (source, wrappedHandler) => {
  const injectedHandlerFilePath = path.resolve(source, '__localstack.js');

  const contents = `
    const AWS = require('aws-sdk');
    const mod = require('./${wrappedHandler.split('.')[0]}');
    AWS.config.update({ endpoint: 'http://' + process.env.LOCALSTACK_HOSTNAME + ':4566' });
    exports.handler = mod['${wrappedHandler.split('.')[1]}'];
  `;

  fs.writeFileSync(injectedHandlerFilePath, contents, 'utf8');

  return injectedHandlerFilePath;
};

const deployLambda = async (source, params = {}) => {
  const functionName = `f-${Number(new Date())}`;

  const injectedHandlerFilePath = createInjectedHandlerFile(
    source,
    params.Handler
  );

  const object = await uploadDirectory(source);

  fs.unlinkSync(injectedHandlerFilePath);

  const lambda = new AWS.Lambda();

  const lambdaParams = {
    FunctionName: functionName,
    Role: 'test',
    Runtime: 'nodejs12.x',
    ...params,
    Handler: '__localstack.handler',
    Code: {
      S3Bucket: object.Bucket,
      S3Key: object.Key,
    },
  };

  const lambdaFunction = await lambda.createFunction(lambdaParams).promise();

  exitHooks.push(() =>
    lambda.deleteFunction({ FunctionName: functionName }).promise()
  );

  return lambdaFunction;
};

const invokeLambda = async (functionName, event = {}) => {
  const lambda = new AWS.Lambda();
  const { Payload } = await lambda
    .invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(event),
    })
    .promise();
  return JSON.parse(Payload);
};

module.exports = {
  createInjectedHandlerFile,
  deployLambda,
  invokeLambda,
};
