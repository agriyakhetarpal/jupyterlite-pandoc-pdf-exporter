// This is a custom webpack configuration for the JupyterLab extension
// builder. I've added  support for .wasm files as asset/resource so
// that pandoc-wasm's binary can be emitted alongside the bundle and
// fetched at runtime. TODO:? find a more robust way to handle this,
// ideally without needing a custom webpack config at all?
module.exports = {
  module: {
    rules: [{ test: /\.wasm$/, type: 'asset/resource' }]
  }
};
