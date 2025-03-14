import 'dotenv/config';

const config = {
  name: 'GastoMetria',
  version: '1.0.0',
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          extraProguardRules: `
            -keepclassmembers class * {
              @com.facebook.react.uimanager.annotations.ReactProp <methods>;
            }
          `
        }
      }
    ]
  ]
};

export default config;
