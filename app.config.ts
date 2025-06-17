import "dotenv/config";

const config = {
  expo: {
    name: "GastoMetria",
    slug: "gastometria",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    scheme: "gastometria",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#fcd877"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.gastometria"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#fcd877"
      },
      package: "com.anonymous.gastometria",
      permissions: [
        "CAMERA",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "ACCESS_WIFI_STATE",
        "BIND_DEVICE_ADMIN"
      ],
      jsEngine: "hermes",
      usesCleartextTraffic: true
    },
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      eas: {
        projectId: "8f96cec6-4172-4010-ad41-ddc7357d734f"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Permitir $(PRODUCT_NAME) acessar a câmera para escanear notas fiscais e QR codes."
        }
      ],
      [
        "expo-dev-client"
      ]
    ]
  }
};

export default config;
