import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
};

export default function LabMap({ latitude, longitude, title }: Props) {
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=ar&z=16&output=embed`;

  return (
    <View style={styles.container}>
      {React.createElement("iframe", {
        title,
        width: "100%",
        height: "100%",
        style: { border: 0, borderRadius: 14 },
        src: embedUrl,
        loading: "lazy",
        allowFullScreen: true,
        referrerPolicy: "no-referrer-when-downgrade",
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 14,
  },
});
