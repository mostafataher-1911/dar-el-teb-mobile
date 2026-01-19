import { useEffect, useState } from "react";
import { I18nManager, Platform } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

// الشاشات
import SplashScreen from "./SplashScreen";
import LoginScreen from "./login";
import TabsScreen from "./(tabs)/_layout";
import ModalScreen from "./modal";
import UnionDetailsScreen from "./unionDetails";
import TestDetailsScreen from "./testDetails";

// Hooks
import { useColorScheme } from "@/hooks/use-color-scheme";

const Stack = createNativeStackNavigator();

// 🔔 إعداد شكل الإشعارات (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [rtlReady, setRtlReady] = useState(false);

  // ✅ إعداد Expo FCM
  useEffect(() => {
    const setupFCM = async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } =
            await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        const enabled = finalStatus === "granted";
        console.log("🔔 Notification permission:", enabled ? "GRANTED" : "DENIED");

        if (!enabled) return;

        const token = (await Notifications.getDevicePushTokenAsync()).data;
        console.log("📱 FCM Token:", token);

        await AsyncStorage.setItem("fcmToken", token);
        await sendTokenToServer(token);
      } catch (error) {
        console.log("❌ FCM Setup Error:", error);
      }
    };

    setupFCM();

    // ✅ استقبال الإشعار والتطبيق مفتوح
    const foregroundSub =
      Notifications.addNotificationReceivedListener(notification => {
        console.log("📩 Foreground notification:", notification);

        Toast.show({
          type: "info",
          text1: notification.request.content.title ?? "تنبيه",
          text2: notification.request.content.body ?? "لديك إشعار جديد",
          position: "top",
          visibilityTime: 5000,
        });
      });

    // ✅ عند الضغط على الإشعار
    const responseSub =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log("🔔 Notification pressed:", response);

        Toast.show({
          type: "success",
          text1: "تم فتح الإشعار",
          text2: "جاري التوجيه...",
          position: "top",
          visibilityTime: 3000,
        });
      });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  // ✅ إرسال التوكن للسيرفر (كما هو)
  const sendTokenToServer = async (token: string) => {
    try {
      const response = await fetch(
        "https://apilab-dev.runasp.net/WeatherForecast/ExpoPush",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            platform: Platform.OS,
            appVersion: "1.0.1",
          }),
        }
      );

      if (response.ok) {
        console.log("✅ FCM token sent to server successfully");
      } else {
        console.log("⚠️ Failed to send FCM token to server");
      }
    } catch (error) {
      console.log("❌ Error sending FCM token:", error);
    }
  };

  // RTL Setup
  useEffect(() => {
    const setupRTL = async () => {
      const shouldBeRTL = false;
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      setRtlReady(true);
    };
    setupRTL();
  }, []);

  if (!rtlReady) return <SplashScreen />;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />

      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="TabsScreen" component={TabsScreen} />
        <Stack.Screen
          name="ModalScreen"
          component={ModalScreen}
          options={{ presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="UnionDetails"
          component={UnionDetailsScreen}
        />
        <Stack.Screen
          name="TestDetails"
          component={TestDetailsScreen}
        />
      </Stack.Navigator>

      <Toast />
    </ThemeProvider>
  );
}
