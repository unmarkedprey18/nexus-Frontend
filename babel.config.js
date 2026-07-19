// Babel converts our modern code so phones can understand it
module.exports = function (api) {
  // Cache the config for faster app startup
  api.cache(true);

  return {
    // Handles all Expo-specific code transformations
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
  };
};