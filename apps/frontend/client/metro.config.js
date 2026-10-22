const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo source packages and client directory
config.watchFolders = [
  projectRoot,
  path.resolve(monorepoRoot, 'packages/api'),
  path.resolve(monorepoRoot, 'packages/ui'),
];

// 2. Let Metro resolve node_modules paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Block .NET backend outputs, git, and other large non-frontend directories from Metro file watcher
const defaultBlockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : config.resolver.blockList
    ? [config.resolver.blockList]
    : [];

config.resolver.blockList = [
  ...defaultBlockList,
  /.*[\/\\]apps[\/\\]backend[\/\\].*/,
  /.*[\/\\]\.git[\/\\].*/,
];

module.exports = config;
