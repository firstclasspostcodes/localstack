const localstackConfig = {
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'local',
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
};

const configureSDKInstance = (sdk) => {
  sdk.config.update(localstackConfig);
};

module.exports = {
  configureSDKInstance,
};
