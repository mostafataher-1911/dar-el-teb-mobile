import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import PageFilters from "@/components/PageFilters";
import { FilterChip } from "@/components/FilterChips";
import SectionWithHorizontalScroll from "@/components/SectionWithHorizontalScroll";

type Lab = {
  id: string;
  name: string;
  imageUrl: string;
  coins: number;
};

type LabSection = {
  category: { name: string };
  labs: Lab[];
};

const SORT_FILTERS: FilterChip[] = [
  { id: "default", label: "الترتيب الافتراضي" },
  { id: "price-asc", label: "الأقل كوينز" },
  { id: "price-desc", label: "الأعلى كوينز" },
];

export default function HomeScreen() {
  const [labsData, setLabsData] = useState<LabSection[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<LabSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("default");

  const categoryFilters: FilterChip[] = useMemo(() => {
    const cats = labsData.map((s) => ({
      id: s.category.name,
      label: s.category.name,
    }));
    return [{ id: "all", label: "كل الفئات" }, ...cats];
  }, [labsData]);

  const applyFilters = (
    source: LabSection[],
    search: string,
    categoryId: string,
    sortId: string
  ) => {
    let result = [...source];

    if (categoryId !== "all") {
      result = result.filter((s) => s.category.name === categoryId);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result
        .map((section) => ({
          ...section,
          labs: section.labs.filter((lab) =>
            lab.name.toLowerCase().includes(searchLower)
          ),
        }))
        .filter((section) => section.labs.length > 0);
    }

    if (sortId === "price-asc" || sortId === "price-desc") {
      const asc = sortId === "price-asc";
      result = result.map((section) => ({
        ...section,
        labs: [...section.labs].sort((a, b) =>
          asc ? a.coins - b.coins : b.coins - a.coins
        ),
      }));
    }

    setFilteredLabs(result);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://apilab.runasp.net/api/ClientMobile/GetMedicalLabs", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "",
            unionId: "00000000-0000-0000-0000-000000000000",
          }),
        });
        const data = await res.json();

        if (data.success && data.resource) {
          interface Section {
            category?: { name: string };
            labs: Lab[];
          }

          const grouped: Record<string, Lab[]> = {};

          data.resource.forEach((section: Section) => {
            section.labs.forEach((lab: Lab) => {
              const categoryName = section.category?.name || "غير مصنف";
              if (!grouped[categoryName]) grouped[categoryName] = [];
              grouped[categoryName].push(lab);
            });
          });

          const groupedArray: LabSection[] = Object.keys(grouped).map((categoryName) => ({
            category: { name: categoryName },
            labs: grouped[categoryName],
          }));

          setLabsData(groupedArray);
          applyFilters(groupedArray, "", "all", "default");
        }
      } catch (err) {
        console.log("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(labsData, text, categoryFilter, sortFilter);
  };

  const handleCategory = (id: string) => {
    setCategoryFilter(id);
    applyFilters(labsData, searchQuery, id, sortFilter);
  };

  const handleSort = (id: string) => {
    setSortFilter(id);
    applyFilters(labsData, searchQuery, categoryFilter, id);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <PageFilters
          searchPlaceholder="ابحث عن نوع التحليل"
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          primaryLabel="الفئة"
          primaryFilters={categoryFilters}
          primarySelected={categoryFilter}
          onPrimarySelect={handleCategory}
          secondaryLabel="الترتيب"
          secondaryFilters={SORT_FILTERS}
          secondarySelected={sortFilter}
          onSecondarySelect={handleSort}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005FA1" />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredLabs.length > 0 ? (
              filteredLabs.map((section, index) => (
                <SectionWithHorizontalScroll
                  key={section.category.name}
                  title={section.category.name}
                  backgroundColor={
                    index % 3 === 0
                      ? "#001D3CF2"
                      : index % 3 === 1
                      ? "#005FA1"
                      : "#09BCDB"
                  }
                  items={section.labs.map((lab) => ({
                    id: lab.id,
                    image: { uri: `https://apilab.runasp.net${lab.imageUrl}` },
                    label: lab.name,
                    coins: lab.coins,
                    category: section.category.name,
                  }))}
                />
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResults}>لا يوجد تحليل مطابق للفلتر ⚠️</Text>
              </View>
            )}
          </ScrollView>
        )}
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
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: hp("1%"),
    paddingBottom: hp("8%"),
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
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("20%"),
  },
  noResults: {
    textAlign: "center",
    fontSize: wp("4%"),
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
