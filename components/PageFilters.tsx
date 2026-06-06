import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import HeaderWithSearch from "@/components/HeaderWithSearch";
import { FilterChip } from "@/components/FilterChips";
import FilterDropdown from "@/components/FilterDropdown";

type Props = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  primaryFilters?: FilterChip[];
  primarySelected?: string;
  onPrimarySelect?: (id: string) => void;
  primaryLabel?: string;
  secondaryFilters?: FilterChip[];
  secondarySelected?: string;
  onSecondarySelect?: (id: string) => void;
  secondaryLabel?: string;
};

type OpenMenu = "primary" | "secondary" | null;

export default function PageFilters({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  primaryFilters,
  primarySelected = "all",
  onPrimarySelect,
  primaryLabel = "تصفية",
  secondaryFilters,
  secondarySelected = "all",
  onSecondarySelect,
  secondaryLabel = "ترتيب",
}: Props) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  const hasPrimary = primaryFilters && primaryFilters.length > 0 && onPrimarySelect;
  const hasSecondary =
    secondaryFilters && secondaryFilters.length > 0 && onSecondarySelect;

  // const stackPrimaryList = (primaryFilters?.length ?? 0) > 3;
  const anyOpen = openMenu !== null;

  const toggle = (menu: OpenMenu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeAll = () => setOpenMenu(null);

  return (
    <View style={styles.container}>
     {searchPlaceholder && onSearchChange && (
  <HeaderWithSearch
    value={searchValue}
    onChangeText={onSearchChange}
    searchPlaceholder={searchPlaceholder}
  />
)}

      {(hasPrimary || hasSecondary) && (
        <View style={[styles.filtersSection, anyOpen && styles.filtersSectionOpen]}>
          <Text style={styles.sectionTitle}>تصفية النتائج</Text>

          {anyOpen && (
            <TouchableWithoutFeedback onPress={closeAll}>
              <View style={styles.dismissLayer} />
            </TouchableWithoutFeedback>
          )}

          <View style={styles.filtersRow}>
  {hasPrimary && (
    <FilterDropdown
      label={primaryLabel}
      options={primaryFilters}
      selectedId={primarySelected}
      onSelect={onPrimarySelect}
      isOpen={openMenu === "primary"}
      onToggle={() => toggle("primary")}
    />
  )}

  {hasSecondary && (
    <FilterDropdown
      label={secondaryLabel}
      options={secondaryFilters}
      selectedId={secondarySelected}
      onSelect={onSecondarySelect}
      isOpen={openMenu === "secondary"}
      onToggle={() => toggle("secondary")}
    />
  )}
</View> 
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? hp("1%") : hp("2%"),
    paddingBottom: hp("5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecef",
    zIndex: 10,
   

  },
  filtersSection: {
    paddingHorizontal: wp("3%"),
    paddingTop: hp("0.5%"),
    paddingBottom: hp("0.5%"),
    position: "relative",
  },
  filtersSectionOpen: {
    zIndex: 200,
    paddingBottom: hp("1%"),
  },
  dismissLayer: {
    position: "absolute",
    top: -400,
    left: -wp("10%"),
    right: -wp("10%"),
    bottom: -hp("50%"),
    zIndex: 0,
  },
  sectionTitle: {
    fontSize: wp("3.2%"),
    color: "#005FA1",
    fontWeight: "700",
    textAlign: "right",
    marginBottom: hp("0.8%"),
    zIndex: 2,
  },
  filtersRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    zIndex: 2,
  },
  stackedLayout: {
    gap: 10,
    zIndex: 2,
  },
});
