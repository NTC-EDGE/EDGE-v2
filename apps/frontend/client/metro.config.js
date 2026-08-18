const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo packages and client directory
config.watchFolders = [
  projectRoot,
  path.resolve(monorepoRoot, 'packages/api'),
  path.resolve(monorepoRoot, 'packages/ui'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 2. Let Metro resolve node_modules paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Block .NET backend outputs and large binary directories from Metro file watcher
config.resolver.blockList = [
  /.*[\/\\]apps[\/\\]backend[\/\\].*/,
  /.*[\/\\]\.git[\/\\].*/,
];

module.exports = config;
