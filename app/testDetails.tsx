import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppointmentRequest } from "@/services/appointmentService";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { favoritesService, FavoriteTest } from "@/services/favoritesService";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AppointmentRequestModal from "@/components/AppointmentRequestModal";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  TabsScreen: {
    screen: "Appointments";
    params: {
      highlightId: string;
      newAppointment: AppointmentRequest;
    };
  };
  TestDetails: { test: FavoriteTest };
};

export default function TestDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { test } = route.params as { test: FavoriteTest };

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [test.id]);

  const checkFavoriteStatus = async () => {
    const favorite = await favoritesService.isFavorite(test.id);
    setIsFavorite(favorite);
    setLoading(false);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(test.id);
        setIsFavorite(false);
        Alert.alert("تم", "تم إزالة التحليل من المفضلة");
      } else {
        await favoritesService.addFavorite(test);
        setIsFavorite(true);
        Alert.alert("تم", "تم إضافة التحليل إلى المفضلة");
      }
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء تحديث المفضلة");
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `تحليل ${test.name}\n\n` +
        `السعر: ${test.coins} كوينز\n` +
        `الفئة: ${test.category || "غير محدد"}\n\n` +
        `من تطبيق دار الطب`;

      await Share.share({
        message: shareMessage,
        title: test.name,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBookingSuccess = (appointment: AppointmentRequest) => {
    setShowBooking(false);
    navigation.navigate("TabsScreen", {
      screen: "Appointments",
      params: {
        highlightId: appointment.id,
        newAppointment: appointment,
      },
    });
  };

  const handleCall = async () => {
    const phoneNumber = "01002281461";
    try {
      const supported = await Linking.canOpenURL(`tel:${phoneNumber}`);
      if (supported) {
        await Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert("خطأ", "لا يمكن إجراء المكالمة على هذا الجهاز");
      }
    } catch {
      Alert.alert("خطأ", "حدث خطأ أثناء إجراء المكالمة");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005FA1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل التحليل</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ff6b6b" : "#fff"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Test Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: test.imageUrl && test.imageUrl.startsWith('http')
                ? test.imageUrl
                : test.imageUrl
                ? `https://apilab.runasp.net${test.imageUrl}`
                : 'https://via.placeholder.com/400x300?text=No+Image'
            }}
            style={styles.testImage}
            resizeMode="cover"
          />
        </View>

        {/* Test Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.testName}>{test.name}</Text>

          <View style={styles.divider} />

          {/* Category */}
          {test.category && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={20} color="#005FA1" />
              <Text style={styles.infoLabel}>الفئة:</Text>
              <Text style={styles.infoValue}>{test.category}</Text>
            </View>
          )}

          {/* Coins */}
          <View style={styles.infoRow}>
            <Ionicons name="diamond-outline" size={20} color="#005FA1" />
            <Text style={styles.infoLabel}>السعر:</Text>
            <View style={styles.coinsContainer}>
              <Text style={styles.coinsValue}>{test.coins}</Text>
              <Text style={styles.coinsText}>كوينز</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowBooking(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>حجز موعد</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#005FA1" />
            <Text style={styles.callButtonText}>اتصال بالمعمل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#ff6b6b" : "#005FA1"}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                isFavorite && styles.favoriteText,
              ]}
            >
              {isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfoCard}>
          <Text style={styles.additionalInfoTitle}>معلومات إضافية</Text>
          <Text style={styles.additionalInfoText}>
            استخدم زر «حجز موعد» لتسجيل طلبك داخل التطبيق ومتابعته من تبويب طلباتي.
          </Text>
          <Text style={styles.additionalInfoText}>
            يمكنك أيضاً زيارة موقعنا في: ش أمام مدرسة الثانوية بنات بجوار مدرسة ميس بيرسون - ملوي - المنيا
          </Text>
        </View>
      </ScrollView>

      {showBooking && (
        <AppointmentRequestModal
          visible
          test={test}
          onClose={() => setShowBooking(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#001D3C",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: hp("5%"),
  },
  imageContainer: {
    width: "100%",
    height: hp("30%"),
    backgroundColor: "#fff",
    marginBottom: hp("2%"),
  },
  testImage: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp("4%"),
    marginBottom: hp("2%"),
    borderRadius: 15,
    padding: wp("5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testName: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#001D3C",
    textAlign: "right",
    marginBottom: hp("1%"),
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: hp("2%"),
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: hp("1.5%"),
    gap: 10,
  },
  infoLabel: {
    fontSize: wp("4%"),
    color: "#666",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: wp("4%"),
    color: "#001D3C",
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  coinsValue: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#005FA1",
  },
  coinsText: {
    fontSize: wp("3.5%"),
    color: "#005FA1",
  },
  actionsContainer: {
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
    gap: 10,
  },
  primaryButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#005FA1",
    borderRadius: 12,
    paddingVertical: hp("2%"),
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  callButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: hp("1.8%"),
    borderWidth: 2,
    borderColor: "#005FA1",
    gap: 10,
  },
  callButtonText: {
    color: "#005FA1",
    fontSize: wp("4.2%"),
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: hp("2%"),
    borderWidth: 2,
    borderColor: "#005FA1",
    gap: 10,
  },
  secondaryButtonText: {
    color: "#005FA1",
    fontSize: wp("4.5%"),
    fontWeight: "600",
  },
  favoriteText: {
    color: "#ff6b6b",
  },
  additionalInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp("4%"),
    borderRadius: 15,
    padding: wp("5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalInfoTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#001D3C",
    marginBottom: hp("1%"),
    textAlign: "right",
  },
  additionalInfoText: {
    fontSize: wp("4%"),
    color: "#666",
    lineHeight: 22,
    textAlign: "right",
    marginBottom: hp("1%"),
  },
});

