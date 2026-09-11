const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env = {}, argv = {}) => ({
  entry: {
    homepage: './src/home/index.js',
    taskpane: './src/taskpane/index.tsx',
    settings: './src/settings/index.tsx',
    commands: './src/commands/commands.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
    publicPath: '/'
  },
  devtool: argv.mode === 'production' ? 'source-map' : 'eval-source-map',
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.svg$/, type: 'asset/resource' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/home/index.html',
      filename: 'index.html',
      chunks: ['homepage'],
      publicPath: './',
      version: require('./package.json').version
    }),
    new HtmlWebpackPlugin({ template: './src/taskpane/index.html', filename: 'taskpane.html', chunks: ['taskpane'] }),
    new HtmlWebpackPlugin({ template: './src/settings/index.html', filename: 'settings.html', chunks: ['settings'] }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.xml', to: 'manifest.xml' },
        { from: 'README.md', to: 'README.md' },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/commands/commands.html', to: 'commands.html' }
      ]
    })
  ],
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    port: 3000,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    allowedHosts: 'all'
  }
});
