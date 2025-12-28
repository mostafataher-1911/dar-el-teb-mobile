import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { favoritesService, FavoriteTest } from "@/services/favoritesService";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  TestDetails: { test: FavoriteTest };
};

export default function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [favorites, setFavorites] = useState<FavoriteTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const favs = await favoritesService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error("Error loading favorites:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل المفضلة");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (testId: string) => {
    Alert.alert(
      "إزالة من المفضلة",
      "هل تريد إزالة هذا التحليل من المفضلة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إزالة",
          style: "destructive",
          onPress: async () => {
            await favoritesService.removeFavorite(testId);
            loadFavorites();
          },
        },
      ]
    );
  };

  const handleTestPress = (test: FavoriteTest) => {
    navigation.navigate("TestDetails", { test });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005FA1" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المفضلة</Text>
        {favorites.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "مسح الكل",
                "هل تريد إزالة جميع التحاليل من المفضلة؟",
                [
                  { text: "إلغاء", style: "cancel" },
                  {
                    text: "مسح الكل",
                    style: "destructive",
                    onPress: async () => {
                      await favoritesService.clearFavorites();
                      loadFavorites();
                    },
                  },
                ]
              );
            }}
            style={styles.clearButton}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>لا توجد مفضلة</Text>
          <Text style={styles.emptyText}>
            أضف التحاليل المفضلة لديك من الشاشة الرئيسية
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {favorites.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.card}
              onPress={() => handleTestPress(test)}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: test.imageUrl.startsWith('http')
                    ? test.imageUrl
                    : `https://apilab-dev.runasp.net${test.imageUrl}`,
                }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {test.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveFavorite(test.id)}
                    style={styles.favoriteButton}
                  >
                    <Ionicons name="heart" size={24} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
                {test.category && (
                  <Text style={styles.cardCategory}>{test.category}</Text>
                )}
                <View style={styles.cardFooter}>
                  <View style={styles.coinsContainer}>
                    <Ionicons name="diamond" size={16} color="#005FA1" />
                    <Text style={styles.coinsText}>{test.coins} كوينز</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleTestPress(test)}
                  >
                    <Text style={styles.viewButtonText}>عرض التفاصيل</Text>
                    <Ionicons name="arrow-forward" size={16} color="#005FA1" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#fff",
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#005FA1",
    fontSize: wp("4%"),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("10%"),
  },
  emptyTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#666",
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  emptyText: {
    fontSize: wp("4%"),
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollContent: {
    padding: wp("4%"),
    paddingBottom: hp("5%"),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: hp("2%"),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: hp("20%"),
  },
  cardContent: {
    padding: wp("4%"),
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },
  cardTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#001D3C",
    flex: 1,
    textAlign: "right",
  },
  favoriteButton: {
    padding: 4,
  },
  cardCategory: {
    fontSize: wp("3.5%"),
    color: "#666",
    marginBottom: hp("1%"),
    textAlign: "right",
  },
  cardFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp("1%"),
  },
  coinsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  coinsText: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: "#005FA1",
  },
  viewButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  viewButtonText: {
    fontSize: wp("4%"),
    color: "#005FA1",
    fontWeight: "600",
  },
});

