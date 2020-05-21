const fs = require('fs');
const os = require('os');
const path = require('path');
const child_process = require('child_process');

const { sep } = path;

const packageDirectory = (source) => {
  const prefix = `${os.tmpdir()}${sep}`;
  const out = `${fs.mkdtempSync(`${os.tmpdir(prefix)}${sep}`)}/archive.zip`;
  child_process.execSync(`zip -r ${out} *`, {
    cwd: path.resolve(source),
  });
  return out;
};

module.exports = {
  packageDirectory,
};
