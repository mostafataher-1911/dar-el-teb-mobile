import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export type FilterChip = {
  id: string;
  label: string;
};

type Props = {
  chips: FilterChip[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
};

export default function FilterChips({ chips, selectedId, onSelect, style }: Props) {
  if (chips.length === 0) return null;

  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {chips.map((chip) => {
          const active = selectedId === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(chip.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
  },
  row: {
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.8%"),
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f4f8",
    borderWidth: 1,
    borderColor: "#d0d7de",
  },
  chipActive: {
    backgroundColor: "#005FA1",
    borderColor: "#005FA1",
  },
  chipText: {
    fontSize: wp("3.5%"),
    color: "#005FA1",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
});
