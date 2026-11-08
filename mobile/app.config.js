module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), ['react-native-maps', {
    androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_KEY,
    iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY,
  }]],
});
