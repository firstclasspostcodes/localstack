const AWS = require('aws-sdk');
const fs = require('fs');

const { exitHooks } = require('./hooks');
const { packageDirectory } = require('./fs');

const ARTIFACTS_BUCKET_NAME = 'localstack-artifacts';

const createArtifactBucket = async () => {
  const s3 = new AWS.S3({ params: { Bucket: ARTIFACTS_BUCKET_NAME } });
  try {
    await s3.headBucket().promise();
  } catch (err) {
    await s3.createBucket().promise();
  }
  return ARTIFACTS_BUCKET_NAME;
};

const uploadArtifact = async (filepath) => {
  const Bucket = await createArtifactBucket();
  const Key = `o-${Number(new Date())}`;

  const s3 = new AWS.S3({ params: { Bucket } });

  await s3.putObject({ Key, Body: fs.readFileSync(filepath) }).promise();

  exitHooks.push(() => s3.deleteObject({ Key }).promise());

  return { Bucket, Key };
};

const uploadDirectory = async (source) => {
  const archive = packageDirectory(source);
  return await uploadArtifact(archive);
};

module.exports = {
  createArtifactBucket,
  uploadArtifact,
  uploadDirectory,
};
