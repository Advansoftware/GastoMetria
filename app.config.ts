import "dotenv/config";

const config = {
  name: "GastoMetria",
  version: "1.0.0",
  android: {
    package: "com.brunoantunes100.gastometria",
  },
  ios: {
    bundleIdentifier: "com.brunoantunes100.gastometria",
  },
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
  },
  plugins: ["expo-router", "expo-barcode-scanner"],
  scheme: "gastometria",
};

export default config;
