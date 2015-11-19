import path from 'path';

module.exports = {
  entry: {
    client: path.resolve(__dirname, '../src/client/index.js')
  },

  output: {
    path: path.resolve(__dirname, '../public'),
    filename: '[name].js'
  },

  node: {
    fs: 'empty'
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['', '.js', '.sass'],
    modulesDirectories: ['src/client', 'node_modules']
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json',
        include: path.resolve(__dirname, '../node_modules/pixi.js')
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        cacheDirectory: true
      },
      {
        test: /\.s[ac]ss$/,
        loader: 'style!css!sass?outputStyle=expanded&includePaths[]=' + path.resolve(__dirname, '../node_modules/foundation-sites/scss')
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      }
    ]
  }
};
