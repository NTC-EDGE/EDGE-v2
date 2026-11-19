module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(\\.bun|(jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|nanoid|query-string|decode-uri-component|split-on-first|filter-obj|escape-string-regexp|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
