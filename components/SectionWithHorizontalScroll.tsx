import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Item = {
  id: string;
  image: any;
  label: string;
  coins: number;
  category?: string;
};

type SectionWithHorizontalScrollProps = {
  title: string;
  backgroundColor?: string;
  items: Item[];
};

type RootStackParamList = {
  TestDetails: { test: any };
};

const SectionWithHorizontalScroll: React.FC<SectionWithHorizontalScrollProps> = ({
  title,
  backgroundColor = "#001D3C",
  items,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCardPress = (item: Item) => {
    navigation.navigate("TestDetails", {
      test: {
        id: item.id,
        name: item.label,
        imageUrl: typeof item.image === 'object' && item.image.uri ? item.image.uri : '',
        coins: item.coins,
        category: title,
      },
    });
  };

  return (
    <View style={[styles.section, { backgroundColor }]}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>{title}:</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.8}
          >
            <Image source={item.image} style={styles.image} resizeMode="cover" />

            <View style={styles.textBox}>
              <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
              <View style={styles.coinsRow}>
                <Text style={styles.coinsText}>كوينز</Text>
                <Text style={styles.coinsValue}>{item.coins}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SectionWithHorizontalScroll;

const styles = StyleSheet.create({
  section: {
    marginVertical: 5,
    
    paddingBottom: 20,
     borderRadius: 12,
    //  width: 430,
     height: 260,
  },
  titleBox: {
      fontFamily: "Roboto",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  title: {
      fontFamily: "Roboto",
    paddingTop: 5,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: 140,
    height: 170,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginRight: 15,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 100, 
  },
  textBox: {
    flex: 1,
    color: "#001D3C",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 16,
   color: "#001D3C",
    textAlign: "center",
    marginBottom: 4,
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coinsText: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 10,
   color: "#001D3C",
  },
  coinsValue: {
    fontFamily: "Roboto",
    fontWeight: "700",
    fontSize: 16,
    color: "#001D3C",
  
  },
});
