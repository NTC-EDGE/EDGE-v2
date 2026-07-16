export default {

  "expo": {
    "platforms": ["ios", "android", "web"],
    "name": "NTC-EDGE",
    "slug": "ntc-edge",
    "owner": "ntc-edge",
    "plugins": [
      "expo-font",
          [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends.",
          "cameraPermission": "This app requires camera access."
        }
      ]
    ],
    "version": process.env.APP_VERSION ?? "1.0.94",
    "orientation": "portrait",
    "icon": "./assets/favicon.png",
    "backgroundColor": "#031A6E",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
    },
    "updates": {
      "enabled": false,
    },
    "jsEngine": "hermes",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "requireFullScreen": true,
      "jsEngine": "hermes",
      "supportsTablet": true,
      "bundleIdentifier": "app.ntcedge.com",
      "buildNumber": process.env.APP_VERSION ?? "1.0.9.5",
      "usesIcloudStorage": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "To enable users to upload their requirement/s and/or proof of payment in every service application.",
        "NSLocationWhenInUseUsageDescription": "Allow $(PRODUCT_NAME) to access your location for notification purposes.",
        "NSFaceIDUsageDescription": "Enabling Face ID allows you quick and secure access to your account.",
        "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to use this device's camera in taking a photo of your requirement/proof of payment.",
        "NSMicrophoneUsageDescription": "Allow $(PRODUCT_NAME) to use this device's microphone."
      }
    },
    "androidStatusBar": {
      "backgroundColor": '#031A6E',
      "translucent": false
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/favicon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.ntcedge.app",
      "versionCode": process.env.ANDROID_VERSION?? 1106
    },
    "web": {
      "favicon": "./assets/favicon.png",
      name: "NTC EDGE Portal",
      shortName: "NTC EDGE",
      meta: {
        description: "Evaluate telecom applications, verify payments, chat/call, and scan QR codes with the official NTC EDGE Portal.",
        themeColor: "#0b5fff",
        apple: {
          webAppTitle: "NTC EDGE Portal"
        },
        og: {
          title: "NTC EDGE Portal – Official Electronic Data Governance & Evaluation",
          description: "Evaluate applications, verify payments, chat/call support, and scan QR codes.",
          image: "./assets/favicon.png",
          url: "https://www.ntcedge.com/"
        },
        twitter: {
          card: "summary_large_image",
          title: "NTC EDGE Portal",
          description: "Official NTC e-services: applications, payment verification, chat/call, QR scanning.",
          image: "./assets/favicon.png"
        }
      }
    },
    "extra": {
      "GITHUB_TOKEN":"ghp_[RETRACTED]",
      "GITHUB_OWNER":"edward1986",
      "GITHUB_REPO":"EDGEissue",

      "oneSignalAppId": "5d0ccbc7-fec7-4375-b029-cbd082a9510f",
      "API_VERSION": process.env.API_VERSION ?? '1.0.9.5',
      "API_URL": process.env.API_URL,
      "eas": {
        "projectId": "0f84a15d-cced-4196-9509-0a24c89b46f0"
      }
    }
  }
}
