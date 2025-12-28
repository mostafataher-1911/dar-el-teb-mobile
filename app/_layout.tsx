
import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import Toast from 'react-native-toast-message';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [rtlReady, setRtlReady] = useState(false);

  // RTL Setup
  useEffect(() => {
    const setupRTL = async () => {
      const shouldBeRTL = false;
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      setRtlReady(true);
    };
    setupRTL();
  }, []);

  if (!rtlReady) return <SplashScreen />;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="TabsScreen" component={TabsScreen} />
        <Stack.Screen name="ModalScreen" component={ModalScreen} options={{ presentation: "modal", headerShown: true }} />
        <Stack.Screen name="UnionDetails" component={UnionDetailsScreen} />
        <Stack.Screen name="TestDetails" component={TestDetailsScreen} />
      </Stack.Navigator>
      
      <Toast />
    </ThemeProvider>
  );
}