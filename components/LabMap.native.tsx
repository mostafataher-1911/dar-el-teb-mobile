import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

type Props = {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
};

export default function LabMap({ latitude, longitude, title, description }: Props) {
  const coordinate = { latitude, longitude };

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        ...coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={false}
    >
      <Marker coordinate={coordinate} title={title} description={description} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
