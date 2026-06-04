import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import PageFilters from "@/components/PageFilters";
import { FilterChip } from "@/components/FilterChips";
import DiscountCard from "@/components/DiscountCard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Union = {
  id: string;
  name: string;
  imageUrl: string;
  disCount: number;
};

const DISCOUNT_FILTERS: FilterChip[] = [
  { id: "all", label: "كل النقابات" },
  { id: "50", label: "خصم 50%+" },
  { id: "30", label: "خصم 30%+" },
  { id: "20", label: "خصم 20%+" },
  { id: "10", label: "خصم 10%+" },
];

const SORT_FILTERS: FilterChip[] = [
  { id: "discount-desc", label: "الأعلى خصماً" },
  { id: "discount-asc", label: "الأقل خصماً" },
  { id: "name-asc", label: "أ-ي" },
];

export default function Unions() {
  type RootStackParamList = {
    UnionDetails: { id: string | number; name: string };
  };

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [unions, setUnions] = useState<Union[]>([]);
  const [filteredUnions, setFilteredUnions] = useState<Union[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("discount-desc");
  const [loading, setLoading] = useState(true);

  const applyFilters = useCallback(
    (source: Union[], search: string, discountId: string, sortId: string) => {
      let result = [...source];

      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter((u) => u.name.toLowerCase().includes(q));
      }

      const minDiscount = parseInt(discountId, 10);
      if (!Number.isNaN(minDiscount)) {
        result = result.filter((u) => (u.disCount ?? 0) >= minDiscount);
      }

      if (sortId === "discount-desc") {
        result.sort((a, b) => (b.disCount ?? 0) - (a.disCount ?? 0));
      } else if (sortId === "discount-asc") {
        result.sort((a, b) => (a.disCount ?? 0) - (b.disCount ?? 0));
      } else if (sortId === "name-asc") {
        result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      }

      setFilteredUnions(result);
    },
    []
  );

  useEffect(() => {
    fetch("https://apilab.runasp.net/api/ClientMobile/GetAllUnion", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.resource) {
          setUnions(data.resource);
          applyFilters(data.resource, "", "all", "discount-desc");
        }
      })
      .catch((err) => console.log("Error fetching unions:", err))
      .finally(() => setLoading(false));
  }, [applyFilters]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(unions, text, discountFilter, sortFilter);
  };

  const handleDiscountFilter = (id: string) => {
    setDiscountFilter(id);
    applyFilters(unions, searchQuery, id, sortFilter);
  };

  const handleSortFilter = (id: string) => {
    setSortFilter(id);
    applyFilters(unions, searchQuery, discountFilter, id);
  };

  const handleNavigate = (union: Union) => {
    navigation.navigate("UnionDetails", {
      id: union.id,
      name: union.name,
    });
  };

  const resultCount = useMemo(
    () => `${filteredUnions.length} من ${unions.length}`,
    [filteredUnions.length, unions.length]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <PageFilters
        searchPlaceholder="ابحث عن النقابة"
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        primaryLabel="نسبة الخصم"
        primaryFilters={DISCOUNT_FILTERS}
        primarySelected={discountFilter}
        onPrimarySelect={handleDiscountFilter}
        secondaryLabel="الترتيب"
        secondaryFilters={SORT_FILTERS}
        secondarySelected={sortFilter}
        onSecondarySelect={handleSortFilter}
      />

      <View style={styles.titleBar}>
        <Text style={styles.titleText}>الخصومات الخاصة بالنقابات</Text>
        <Text style={styles.resultCount}>النتائج: {resultCount}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005FA1" />
          <Text style={styles.loadingLabel}>جاري التحميل...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredUnions.length > 0 ? (
            filteredUnions.map((union) => (
              <DiscountCard
                key={union.id}
                imageSource={{ uri: `https://apilab.runasp.net${union.imageUrl}` }}
                unionName={union.name}
                discount={`${union.disCount}%`}
                onPress={() => handleNavigate(union)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>لا توجد نقابات مطابقة للفلتر</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleBar: {
    backgroundColor: "#001D3C",
    marginHorizontal: wp("4%"),
    marginTop: hp("1%"),
    borderRadius: 20,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    alignItems: "center",
  },
  titleText: {
    fontWeight: "700",
    fontSize: wp("5%"),
    color: "#FFFFFF",
    textAlign: "center",
  },
  resultCount: {
    marginTop: 6,
    fontSize: wp("3.2%"),
    color: "#B9D4E8",
  },
  scrollContainer: {
    padding: 20,
    marginTop: 10,
    paddingBottom: 30,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingLabel: {
    marginTop: 10,
    color: "#005FA1",
  },
  emptyText: {
    color: "#c62828",
    marginTop: 20,
    fontSize: wp("4%"),
    textAlign: "center",
  },
});
