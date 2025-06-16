module.exports = {
  require: ['chai'],  // Ubah ini, jangan gunakan register-expect
  timeout: 5000,
  colors: true,
  ui: 'bdd',
  spec: 'test/mocha/**/*.test.js',
  recursive: true,
  reporter: 'spec',
  exit: true
};