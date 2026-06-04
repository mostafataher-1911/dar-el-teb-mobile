import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AccountScreen from "./account";
import UnionsScreen from "./unions";
import HomeScreen from "./index";
import LabLocationScreen from "./LabLocationScreen";
import OffersScreen from "./offers";
import FavoritesScreen from "./favorites";
import AppointmentsScreen from "./appointments";

const Tab = createBottomTabNavigator();

export default function TabsScreen() {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkGuestStatus();
  }, []);

  const checkGuestStatus = async () => {
    try {
      const guestStatus = await AsyncStorage.getItem("isGuest");
      setIsGuest(guestStatus === "true");
    } catch (error) {
      console.log("Error checking guest status:", error);
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#005FA1",
        tabBarInactiveTintColor: "#B9BCBE",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: "طلباتي",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-note" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "المفضلة",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Unions"
        component={UnionsScreen}
        options={{
          title: "النقابات",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="OffersScreen"
        component={OffersScreen}
        options={{
          title: "العروض",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-offer" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="LabLocation"
        component={LabLocationScreen}
        options={{
          title: "موقعنا",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="location-on" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: isGuest ? "تسجيل الدخول" : "حسابي",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name={isGuest ? "login" : "person"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
