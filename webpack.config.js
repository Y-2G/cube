const path = require('path');

const MODE = 'development';
const isUseMinimize = MODE === 'development';
const outputPath = 'pub';

module.exports = {
  mode: MODE,
  entry: path.resolve(__dirname, 'src/script/main.js'),
  output: {
    filename: 'script/app.js',
    path: path.resolve(__dirname, outputPath),
  },
  optimization: {
    minimize: isUseMinimize,
  },
  devServer: {
    contentBase: outputPath,
    open: true
  }
};
