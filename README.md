# Localstack

We use this library to help integrate [localstack](https://github.com/localstack/localstack) into our test suite.

### Requirements

- Docker
- Docker Compose

## Getting Started

First install the library:

```
npm i @firstclasspostcodes/localstack -D
```

Add the following to a `jest.config.js` file:

```js
module.exports = {
  // starts localstack when test execution begins
  globalSetup: '@firstclasspostcodes/localstack/setup',
  // optional: teardown localstack after tests complete
  globalTeardown: '@firstclasspostcodes/localstack/teardown',
  setupFiles: ['./jest.setup.js'],
};
```

This starts & stops localstack before & after test execution. We also **wait for localstack to be ready** before completing the setup.

Inside `jest.setup.js`, you'll want to include the following:

```js
const AWS = require('aws-sdk');
const localstack = require('@firstclasspostcodes/localstack');

localstack.configureSDKInstance(AWS);

global.localstack = localstack;
```

Using `global.localstack` allows you easy access to the following helpers:

#### `createArtifactBucket()`

Creates a shared artifact bucket, useful for uploading objects into. This returns the name of the bucket.

#### `uploadArtifact(filepath)`

Uploads an artifact to the artifact bucket and takes care of deleting it before the process exits.

#### `uploadDirectory(source)`

Packages a directory as a ZIP archive and uploads it as an artifact to the artifact bucket.

#### `deployLambda(source, params = {})`

Takes a source directory (similar to `CodeUri`), archives it and creates a Lambda function.

> **Note:** The deployed lambda function has a wrapped handler, configuring the AWS SDK (running inside the Lambda function) to talk to localstack and not AWS. So no manual configuration of your functions is necessary.

#### `invokeLambda(functionName, event = {})`

Invokes the lambda with the provided name, returning the parsed JSON response.
