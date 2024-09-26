const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const uuid = require('uuid')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const envKeys = {
  'process.env.CONTENT_SCRIPT_URL': `"${uuid.v4()}"`,
}

module.exports = {
  entry: {
    popup: path.resolve("src/popup/popup.tsx"),
    inject: path.resolve('src/inject/inject.ts'),
    background: path.resolve('src/background/background.ts'),
    contentScript: path.resolve('src/contentScript/contentScript.ts'),
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.tsx?$/,
        exclude: /node_modules/,
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/i,
      },
      {
        type: 'asset/resource',
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg|data|wasm)$/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('src/static'),
          to: path.resolve('dist'),
        },
      ],
    }),
    new webpack.DefinePlugin(envKeys),
    new NodePolyfillPlugin({
      onlyAliases: ["fs", "util"],
    }),
    ...getHtmlPlugins(['popup']),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,  // explicitly ignore 'fs' for browser use
    }
  },
  output: {
    filename: '[name].js',
    chunkFilename: 'chunk.[name].js',  // Control chunk filenames explicitly
    path: path.resolve('dist'),
  },
  // optimization: {
  //   splitChunks: {
  //     chunks(chunk) {
  //       // return chunk.name !== 'contentScript'
  //       return true
  //     },
  //   },
  // },
}

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: 'React Extension',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  )
}
