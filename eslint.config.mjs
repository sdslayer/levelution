import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import webpack from 'webpack';

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  pluginReactConfig,
  {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.CI': JSON.stringify(false)
      })
    ]
  }
];
