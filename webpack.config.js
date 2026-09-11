const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

class ManifestTemplatePlugin {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('ManifestTemplatePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'ManifestTemplatePlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
        () => {
          const template = fs.readFileSync(path.resolve(__dirname, 'manifest.template.xml'), 'utf8');
          compilation.emitAsset('manifest.xml', new compiler.webpack.sources.RawSource(template.replaceAll('{{BASE_URL}}', this.baseUrl)));
        }
      );
    });
  }
}

module.exports = (env = {}, argv = {}) => {
  const baseUrl = fs.readFileSync(path.resolve(__dirname, `.env.${argv.mode || 'development'}`), 'utf8').match(/^BASE_URL=(.+)$/m)?.[1].trim() || 'https://localhost:3000';
  return {
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
    new webpack.DefinePlugin({ __BASE_URL__: JSON.stringify(baseUrl) }),
    new HtmlWebpackPlugin({
      template: './src/home/index.html',
      filename: 'index.html',
      chunks: ['homepage'],
      publicPath: './',
      version: require('./package.json').version,
      appName: 'Outlook Group Mail Classifier',
      repository: 'https://github.com/kingchun1991/outlook-group-mail-classifier',
      pagesUrl: 'https://kingchun1991.github.io/outlook-group-mail-classifier',
      baseUrl
    }),
    new HtmlWebpackPlugin({ template: './src/taskpane/index.html', filename: 'taskpane.html', chunks: ['taskpane'] }),
    new HtmlWebpackPlugin({ template: './src/settings/index.html', filename: 'settings.html', chunks: ['settings'] }),
    new CopyPlugin({
      patterns: [
        { from: 'README.md', to: 'README.md' },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/commands/commands.html', to: 'commands.html' }
      ]
    }),
    new ManifestTemplatePlugin(baseUrl)
  ],
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    port: 3000,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    allowedHosts: 'all'
  }
  };
};
