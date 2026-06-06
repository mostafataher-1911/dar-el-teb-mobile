import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PageFilters from "@/components/PageFilters";
import { FilterChip } from "@/components/FilterChips";

type Banner = {
  imageUrl: string;
  name?: string;
  title?: string;
  description?: string;
  id?: string;
  displayLabel: string;
};

const OFFER_FILTERS: FilterChip[] = [
  { id: "all", label: "كل العروض" },
  { id: "newest", label: "الأحدث" },
  { id: "oldest", label: "الأقدم" },
];

function normalizeBanners(resource: any[]): Banner[] {
  return resource.map((item, index) => ({
    ...item,
    displayLabel:
      item.name ||
      item.title ||
      item.description ||
      `عرض ${index + 1}`,
  }));
}

export default function OffersScreen() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [offerFilter, setOfferFilter] = useState("all");

  const applyFilters = useCallback(
    (source: Banner[], search: string, filterId: string) => {
      let result = [...source];

      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter((item) =>
          item.displayLabel.toLowerCase().includes(q)
        );
      }

      if (filterId === "newest") {
        result = [...result].reverse();
      } else if (filterId === "oldest") {
        result = [...result];
      }

      setFilteredBanners(result);
    },
    []
  );

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("https://apilab.runasp.net/api/ClientMobile/GetResponserImage", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.success && data.resource) {
          const normalized = normalizeBanners(data.resource);
          setBanners(normalized);
          applyFilters(normalized, "", "all");
        }
      } catch (err) {
        console.log("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [applyFilters]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(banners, text, offerFilter);
  };

  const handleFilter = (id: string) => {
    setOfferFilter(id);
    applyFilters(banners, searchQuery, id);
  };

  const handleShare = async (banner: Banner) => {
    try {
      const shareMessage =
        `عرض خاص من معمل دار الطب\n\n` +
        `${banner.displayLabel}\n\n` +
        `شاهد هذا العرض في تطبيق دار الطب`;

      await Share.share({
        message: shareMessage,
        title: banner.displayLabel,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const resultCount = useMemo(
    () => `${filteredBanners.length} من ${banners.length}`,
    [filteredBanners.length, banners.length]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005FA1" />
          <Text style={styles.loadingText}>جاري تحميل العروض...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
     
     
      <View style={styles.container}>
         <View style={styles.header}>
          <Text style={styles.headerTitle}>عروض خاصة</Text>
        </View>
         <PageFilters
        
          primaryLabel="نوع العرض"
          primaryFilters={OFFER_FILTERS}
          primarySelected={offerFilter}
          onPrimarySelect={handleFilter}
        />
      

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredBanners.length > 0 ? (
            filteredBanners.map((item, index) => (
              <View key={`${item.id ?? index}-${item.displayLabel}`} style={styles.bannerCard}>
                <Text style={styles.bannerLabel}>{item.displayLabel}</Text>
                <Image
                  source={{ uri: `https://apilab.runasp.net${item.imageUrl}` }}
                  style={styles.bannerImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(item)}
                >
                  <Ionicons name="share-outline" size={20} color="#005FA1" />
                  <Text style={styles.shareButtonText}>مشاركة</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد عروض مطابقة للفلتر</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  resultCount: {
    textAlign: "right",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("0.8%"),
    color: "#666",
    fontSize: wp("3.5%"),
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: wp("4%"),
    paddingBottom: hp("5%"),
  },
  bannerCard: {
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  bannerLabel: {
    paddingHorizontal: wp("4%"),
    paddingTop: hp("1.5%"),
    fontSize: wp("4%"),
    fontWeight: "700",
    color: "#001D3C",
    textAlign: "right",
  },
  bannerImage: {
    width: "100%",
    height: hp("30%"),
  },
  shareButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: 10,
    margin: hp("1%"),
    gap: 8,
  },
  shareButtonText: {
    color: "#005FA1",
    fontSize: wp("4%"),
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    color: "#005FA1",
    fontSize: wp("4%"),
    marginTop: hp("1%"),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("20%"),
  },
  emptyText: {
    fontSize: wp("4.5%"),
    color: "#6c757d",
    textAlign: "center",
  },
});
