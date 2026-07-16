const { withExpoWebpack } = require('@expo/electron-adapter');

const aliases = {
  "@assets": "./assets",
  "@styles": "./src/styles",
  "@components": "./src/components",
  "@atoms": "./src/components/atoms",
  "@molecules": "./src/components/molecules",
  "@organisms": "./src/components/organisms",
  "@templates": "./src/components/templates",
  "@pages": "./src/components/pages",
  "@screens": "./src/screens",
  "@reducers": "./src/redux/reducers",
  "@sagas": "./src/redux/sagas",
  "@hooks": "./src/hooks",
  "@config": "./config",
  "@services": "./src/services",
  "@utils": "./src/utils",
};

const babelLoaderRules = [{
  test: /\.ts/,
  loader: 'babel-loader',
  options: {
    presets: ['babel-preset-expo'],
  },
}];

// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(config) {
  // If you want to add a new alias to the config.
  const expoConfig = withExpoWebpack(config)
  expoConfig.resolve.alias = {
    ...config.resolve.alias,
    ...aliases
  };
  expoConfig.resolve.extensions.push('.web.js', '.web.ts', '.web.tsx');
  expoConfig.module.rules = [
    ...expoConfig.module.rules,
    ...babelLoaderRules,
  ];
  // Finally return the new config for the CLI to use.
  return expoConfig;

};