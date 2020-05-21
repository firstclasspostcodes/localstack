const AWS = require('aws-sdk');

const s3 = require('./s3');
const aws = require('./aws');
const lambda = require('./lambda');

aws.configureSDKInstance(AWS);

module.exports = {
  ...aws,
  ...lambda,
  ...s3,
};
