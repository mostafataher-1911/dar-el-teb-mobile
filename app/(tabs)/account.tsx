import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import LogoutButton from "@/components/LogoutButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeleteAccountButton from "@/components/DeleteAccountButton";

type UserData = {
  name?: string;
  phone?: string;
  address?: string;
  bonus?: number;
};

type TabNav = BottomTabNavigationProp<{ Appointments: undefined }>;

export default function AccountScreen() {
  const navigation = useNavigation<TabNav>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const guestStatus = await AsyncStorage.getItem("isGuest");
      if (guestStatus === "true") {
        setIsGuest(true);
        setUserData(null);
        setLoading(false);
        return;
      }

      setIsGuest(false);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const response = await fetch("https://apilab.runasp.net/api/ClientMobile/GetProfile", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.multiRemove(["token", "userName", "phoneNumber"]);
        }
        setLoading(false);
        return;
      }

      const text = await response.text();
      if (!text.trim()) {
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      if (!data?.resource) {
        setLoading(false);
        return;
      }

      const res = data.resource;
      setUserData({
        name: res.name ?? res.username ?? "",
        phone: res.phone ?? res.phoneNumber ?? "",
        address: res.address ?? "",
        bonus: typeof res.bonus === "number" ? res.bonus : Number(res.bonus) || 0,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserData();
    }, [fetchUserData])
  );

  const goToLogin = async () => {
    await AsyncStorage.removeItem("isGuest");
    const parent = navigation.getParent();
    parent?.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#005FA1" />
      </View>
    );
  }

  if (isGuest || !userData) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.guestCard}>
          <Ionicons name="person-circle-outline" size={64} color="#005FA1" />
          <Text style={styles.guestTitle}>سجّل الدخول لحسابك</Text>
          <Text style={styles.guestText}>
            احصل على رصيد الكوينز، تتبع طلبات الحجز، وإشعارات العروض الخاصة
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={goToLogin}>
            <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("Appointments")}
          >
            <Ionicons name="calendar-outline" size={20} color="#005FA1" />
            <Text style={styles.secondaryBtnText}>عرض طلبات الحجز</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>أهلا بك في معمل دار الطب</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>الاسم:</Text>
        <View style={styles.displayBox}>
          <Text style={styles.value}>{userData.name || "غير متوفر"}</Text>
          <Ionicons name="person-outline" size={wp("6%")} style={styles.icon} />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>رقم الهاتف:</Text>
        <View style={styles.displayBox}>
          <Text style={styles.value}>{userData.phone || "غير متوفر"}</Text>
          <Feather name="phone" size={wp("5.5%")} style={styles.icon} />
        </View>
      </View>

      <View style={styles.coinsContainer}>
        <Text style={styles.labelcoins}>عدد الكوينز:</Text>
        <View style={styles.coinsBox}>
          <Image
            source={require("../../assets/images/Group 27.png")}
            style={styles.coinsIcon}
            resizeMode="contain"
          />
          <Text style={styles.coinsValue}>{userData.bonus ?? 0}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.appointmentsLink}
        onPress={() => navigation.navigate("Appointments")}
      >
        <Ionicons name="calendar" size={22} color="#fff" />
        <Text style={styles.appointmentsLinkText}>طلبات الحجز الخاصة بي</Text>
      </TouchableOpacity>

      <View style={{ marginTop: hp("2%") }}>
        <LogoutButton />
      </View>

      <View style={{ marginTop: hp("1%") }}>
        <DeleteAccountButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp("5%"),
  },
  logo: {
    position: "absolute",
    top: "35%",
    width: wp("90%"),
    height: wp("90%"),
    opacity: 0.08,
  },
  guestCard: {
    width: wp("90%"),
    alignItems: "center",
    marginTop: Platform.select({ ios: hp("12%"), android: hp("8%") }),
    padding: wp("6%"),
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    zIndex: 1,
  },
  guestTitle: {
    fontSize: wp("5.5%"),
    fontWeight: "bold",
    color: "#001D3C",
    marginTop: hp("2%"),
    textAlign: "center",
  },
  guestText: {
    fontSize: wp("4%"),
    color: "#666",
    textAlign: "center",
    marginTop: hp("1%"),
    lineHeight: 22,
  },
  loginBtn: {
    marginTop: hp("3%"),
    backgroundColor: "#005FA1",
    width: "100%",
    paddingVertical: hp("2%"),
    borderRadius: 14,
    alignItems: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  secondaryBtn: {
    marginTop: hp("1.5%"),
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingVertical: hp("1.5%"),
  },
  secondaryBtnText: {
    color: "#005FA1",
    fontSize: wp("4%"),
    fontWeight: "600",
  },
  welcomeBox: {
    width: wp("90%"),
    height: hp("7%"),
    borderRadius: 30,
    backgroundColor: "#005FA1",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.select({ ios: hp("10%"), android: hp("5%") }),
    marginBottom: hp("3%"),
    shadowColor: "#001D3C",
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  welcomeText: {
    fontSize: wp("5%"),
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  inputContainer: {
    width: wp("90%"),
    marginTop: hp("1%"),
    zIndex: 1,
  },
  label: {
    fontSize: wp("4%"),
    color: "#4c9bd3ff",
    marginBottom: hp("1%"),
    textAlign: "right",
    fontWeight: "700",
    alignSelf: "flex-end",
  },
  labelcoins: {
    fontSize: wp("4%"),
    color: "#4c9bd3ff",
    marginBottom: hp("1%"),
    textAlign: "right",
    fontWeight: "700",
  },
  displayBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: hp("8%"),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4c9bd3ff",
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: wp("4%"),
  },
  icon: {
    color: "#4c9bd3ff",
  },
  value: {
    fontSize: wp("4.5%"),
    color: "#4c9bd3ff",
    textAlign: "right",
    flex: 1,
    marginRight: wp("2%"),
  },
  coinsContainer: {
    marginTop: hp("2%"),
    alignItems: "center",
    width: "100%",
    zIndex: 1,
  },
  coinsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: wp("50%"),
    height: hp("6%"),
    borderRadius: 20,
    backgroundColor: "#4087B9",
    paddingHorizontal: wp("4%"),
    marginTop: hp("1%"),
  },
  coinsIcon: {
    marginRight: wp("2%"),
    width: wp("7%"),
    height: wp("7%"),
  },
  coinsValue: {
    fontSize: wp("5%"),
    color: "#fff",
    fontWeight: "bold",
  },
  appointmentsLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: hp("2%"),
    width: wp("90%"),
    paddingVertical: hp("1.8%"),
    backgroundColor: "#001D3C",
    borderRadius: 14,
    zIndex: 1,
  },
  appointmentsLinkText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "600",
  },
});
