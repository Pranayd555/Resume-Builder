module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore source map warnings from CKEditor
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/@ckeditor/,
          message: /Failed to parse source map/,
        },
        {
          message: /Failed to parse source map from 'ckeditor\.js\.map'/,
        }
      ];

      return webpackConfig;
    },
  },
};
