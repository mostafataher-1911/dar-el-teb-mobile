import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import LabMap from "@/components/LabMap";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const LAB_COORDS = {
  latitude: 31.1149122,
  longitude: 33.6902313,
};

export default function LabLocationScreen() {
  const openMaps = async () => {
    try {
      const url = `https://maps.google.com/?q=${LAB_COORDS.latitude},${LAB_COORDS.longitude}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("خطأ", "لا يمكن فتح الخرائط");
      }
    } catch {
      Alert.alert("خطأ", "حدث خطأ أثناء فتح الخرائط");
    }
  };

  const callPhone = async () => {
    try {
      const url = "tel:01223649261";
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("خطأ", "لا يمكن إجراء المكالمة");
      }
    } catch {
      Alert.alert("خطأ", "حدث خطأ أثناء إجراء المكالمة");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Text style={styles.title}>موقع المعمل</Text>

      <View style={styles.mapContainer}>
        <LabMap
          latitude={LAB_COORDS.latitude}
          longitude={LAB_COORDS.longitude}
          title="معمل دار الطب"
          description="ملوي - المنيا"
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.labName}>معمل دار الطب</Text>

        <Text style={styles.address}>
          ش أمام مدرسة الثانوية بنات بجوار مدرسة ميس بيرسون — ملوي — المنيا
        </Text>

        <TouchableOpacity style={styles.contactItem} onPress={callPhone}>
          <Text style={styles.contactText}>01223649261</Text>
          <Ionicons name="call" size={24} color="#005FA1" />
        </TouchableOpacity>

        <View style={styles.hoursSection}>
          <Text style={styles.sectionTitle}>أوقات العمل</Text>
          <Text style={styles.hours}>من 8:30 صباحاً حتى 10:00 مساءً</Text>
          <Text style={styles.hours}>الجمعة من 10:00 صباحاً حتى 10:00 مساءً</Text>
          <Text style={styles.hours}>طوال أيام الأسبوع</Text>
        </View>

        <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.mapButtonText}>التوجيه عبر خرائط جوجل</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#005FA1",
    textAlign: "center",
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
  },
  mapContainer: {
    height: hp("28%"),
    marginHorizontal: wp("4%"),
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: wp("5%"),
    marginHorizontal: wp("4%"),
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labName: {
    fontSize: wp("5.5%"),
    fontWeight: "bold",
    color: "#005FA1",
    textAlign: "center",
    marginBottom: hp("1%"),
  },
  address: {
    fontSize: wp("3.8%"),
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: hp("2%"),
  },
  contactItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: hp("2%"),
    gap: 10,
  },
  contactText: {
    fontSize: wp("4%"),
    color: "#005FA1",
    fontWeight: "bold",
  },
  hoursSection: {
    backgroundColor: "#f0f7ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: hp("2%"),
  },
  sectionTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "#005FA1",
    marginBottom: 10,
    textAlign: "center",
  },
  hours: {
    fontSize: wp("3.5%"),
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  mapButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#005FA1",
    borderRadius: 10,
    padding: 15,
    gap: 10,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
});
