import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ForecastScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Forecast Screen</Text>
      {/* Add your forecast components here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForecastScreen;
