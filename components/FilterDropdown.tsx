import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { FilterChip } from "@/components/FilterChips";

const LIST_MAX_HEIGHT = 220;

type Props = {
  label: string;
  options: FilterChip[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
  isOpen: boolean;
  onToggle: () => void;
  /** Full width row — better for long category lists */
  fullWidth?: boolean;
};

export default function FilterDropdown({
  label,
  options,
  selectedId,
  onSelect,
  style,
  isOpen,
  onToggle,
  fullWidth = false,
}: Props) {
  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  const handleSelect = (id: string) => {
    onSelect(id);
    if (isOpen) onToggle();
  };

  return (
    <View
      style={[
        styles.wrapper,
        fullWidth && styles.wrapperFull,
        isOpen && styles.wrapperOpen,
        style,
      ]}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.trigger, isOpen && styles.triggerOpen]}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#005FA1"
        />
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? "اختر"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.listPanel}>
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option, index) => {
              const active = option.id === selectedId;
              const isLast = index === options.length - 1;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    active && styles.optionActive,
                    isLast && styles.optionLast,
                  ]}
                  onPress={() => handleSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.optionText, active && styles.optionTextActive]}
                  >
                    {option.label}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#005FA1"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  wrapperFull: {
    flex: undefined,
    width: "100%",
  },
  wrapperOpen: {
    zIndex: 100,
    ...Platform.select({
      ios: {},
      android: { elevation: 12 },
      default: {},
    }),
  },
  fieldLabel: {
    fontSize: wp("3%"),
    color: "#666",
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 4,
  },
  trigger: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#c5d4e3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: hp("1.2%"),
    minHeight: 44,
  },
  triggerOpen: {
    borderColor: "#005FA1",
    backgroundColor: "#E3F2FD",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  triggerText: {
    flex: 1,
    fontSize: wp("3.5%"),
    color: "#001D3C",
    fontWeight: "600",
    textAlign: "right",
  },
  listPanel: {
    marginTop: -1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#005FA1",
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    shadowColor: "#001D3C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  listScroll: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  listContent: {
    paddingVertical: 4,
  },
  option: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: hp("1.2%"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8ecef",
    gap: 8,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionActive: {
    backgroundColor: "#E8F4FC",
  },
  optionText: {
    flex: 1,
    fontSize: wp("3.4%"),
    color: "#333",
    textAlign: "right",
    lineHeight: 20,
  },
  optionTextActive: {
    color: "#005FA1",
    fontWeight: "700",
  },
  checkIcon: {
    flexShrink: 0,
  },
});
