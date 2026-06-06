import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  appointmentService,
  AppointmentRequest,
} from "@/services/appointmentService";

const LAB_PHONE = "01223649261";

const statusLabel: Record<AppointmentRequest["status"], string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};

type AppointmentsParams = {
  highlightId?: string;
  newAppointment?: AppointmentRequest;
};

type TabParamList = {
  Appointments: AppointmentsParams | undefined;
  Home: undefined;
};

function mergeAppointments(
  stored: AppointmentRequest[],
  incoming?: AppointmentRequest
): AppointmentRequest[] {
  if (!incoming) return stored;
  const exists = stored.some((a) => a.id === incoming.id);
  if (exists) return stored;
  return [incoming, ...stored];
}

export default function AppointmentsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const route = useRoute<RouteProp<TabParamList, "Appointments">>();
  const highlightId = route.params?.highlightId;
  const newAppointment = route.params?.newAppointment;

  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const load = useCallback(async () => {
    try {
      if (newAppointment) {
        await appointmentService.ensureAppointment(newAppointment);
      }

      const stored = await appointmentService.getAppointments();
      const merged = mergeAppointments(stored, newAppointment);
      const visible = merged.filter((a) => a.status !== "cancelled");
      setAppointments(visible);

      if (newAppointment || highlightId) {
        setShowSuccessBanner(true);
      }
    } catch (error) {
      console.error("load appointments:", error);
      Alert.alert("خطأ", "تعذر تحميل طلبات الحجز");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [newAppointment, highlightId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  useFocusEffect(
    useCallback(() => {
      if (!highlightId && !newAppointment) return;
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
        navigation.setParams({
          highlightId: undefined,
          newAppointment: undefined,
        });
      }, 5000);
      return () => clearTimeout(timer);
    }, [highlightId, newAppointment, navigation])
  );

  const handleCancel = (item: AppointmentRequest) => {
    Alert.alert("إلغاء الطلب", "هل تريد إلغاء طلب الحجز؟", [
      { text: "لا", style: "cancel" },
      {
        text: "نعم",
        style: "destructive",
        onPress: async () => {
          await appointmentService.cancelAppointment(item.id);
          load();
        },
      },
    ]);
  };

  const handleWhatsApp = async (item: AppointmentRequest) => {
    const message = appointmentService.buildWhatsAppMessage(item);
    const phone = "201223649261";
    const appUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpen ? appUrl : webUrl);
    } catch {
      Alert.alert("خطأ", "لا يمكن فتح واتساب");
    }
  };

  const handleCall = async () => {
    try {
      await Linking.openURL(`tel:${LAB_PHONE}`);
    } catch {
      Alert.alert("خطأ", "لا يمكن إجراء المكالمة");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#005FA1" />
          <Text style={styles.loadingText}>جاري تحميل الطلبات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طلبات الحجز</Text>
        
      </View>

      {showSuccessBanner && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={22} color="#2e7d32" />
          <Text style={styles.successBannerText}>تم تأكيد طلب الحجز وإضافته بنجاح</Text>
        </View>
      )}

      {appointments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={72} color="#ccc" />
          <Text style={styles.emptyTitle}>لا توجد طلبات حجز</Text>
          <Text style={styles.emptyText}>
            اختر أي تحليل من الرئيسية واضغط «حجز موعد» ثم «تأكيد طلب الحجز»
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.browseBtnText}>تصفح التحاليل</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        >
          {appointments.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                highlightId === item.id && styles.cardHighlighted,
              ]}
            >
              <View style={styles.cardHeader}>
                {/* <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.testName}
                </Text> */}
                <View
                  style={[
                    styles.badge,
                    item.status === "pending" && styles.badgePending,
                  ]}
                >
                  <Text style={styles.badgeText}>{statusLabel[item.status]}</Text>
                </View>
              </View>

              <Text style={styles.row}>👤 {item.patientName}</Text>
              <Text style={styles.row}>📅 {item.preferredDate} — {item.preferredTime}</Text>
              <Text style={styles.row}>📞 0{item.phone}</Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}

              {item.status === "pending" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleWhatsApp(item)}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#005FA1" />
                    <Text style={styles.actionText}>واتساب</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                    <Ionicons name="call-outline" size={18} color="#005FA1" />
                    <Text style={styles.actionText}>اتصال</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => handleCancel(item)}
                  >
                    <Text style={styles.cancelText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 10,
    color: "#005FA1",
    fontSize: wp("4%"),
  },
  header: {
     backgroundColor: "#001D3C",
     marginHorizontal: wp("4%"),
     marginTop: hp("1%"),
     borderRadius: 20,
     paddingVertical: hp("1.5%"),
     paddingHorizontal: wp("4%"),
     alignItems: "center",
  },
  headerTitle: {
     fontWeight: "700",
     fontSize: wp("5%"),
     color: "#FFFFFF",
     textAlign: "center",
  },
  headerCount: {
    marginTop: 4,
    fontSize: wp("3.5%"),
    color: "#B9D4E8",
  },
  successBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    marginHorizontal: wp("4%"),
    marginTop: hp("1%"),
    padding: wp("3%"),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  successBannerText: {
    flex: 1,
    color: "#2e7d32",
    fontSize: wp("3.8%"),
    fontWeight: "600",
    textAlign: "right",
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: "#005FA1",
    backgroundColor: "#F0F8FF",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("10%"),
  },
  emptyTitle: {
    fontSize: wp("5.5%"),
    fontWeight: "bold",
    color: "#666",
    marginTop: hp("2%"),
  },
  emptyText: {
    fontSize: wp("4%"),
    color: "#999",
    textAlign: "center",
    marginTop: hp("1%"),
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: hp("3%"),
    backgroundColor: "#005FA1",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseBtnText: { color: "#fff", fontWeight: "bold", fontSize: wp("4%") },
  scroll: { padding: wp("4%"), paddingBottom: hp("6%") },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: wp("4%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp("1%"),
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#001D3C",
    textAlign: "right",
  },
  badge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePending: { backgroundColor: "#FFF3E0" },
  badgeText: { fontSize: wp("3%"), color: "#005FA1", fontWeight: "600" },
  row: {
    fontSize: wp("3.8%"),
    color: "#444",
    textAlign: "right",
    marginBottom: 4,
  },
  notes: {
    fontSize: wp("3.5%"),
    color: "#666",
    textAlign: "right",
    marginTop: 6,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row-reverse",
    marginTop: hp("1.5%"),
    gap: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
  },
  actionText: { color: "#005FA1", fontWeight: "600", fontSize: wp("3.5%") },
  cancelBtn: { backgroundColor: "#FFEBEE" },
  cancelText: { color: "#c62828", fontWeight: "600", fontSize: wp("3.5%") },
});
