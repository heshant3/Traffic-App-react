import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";

const LocationPermissionScreen = () => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const checkPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setPermissionStatus("granted");
      } else {
        setPermissionStatus("denied");
        setErrorMsg("Permission to access location was denied");
      }
    };

    checkPermission();
  }, []);

  const handleNavigateToMap = async () => {
    if (permissionStatus === "granted") {
      let location = await Location.getCurrentPositionAsync({});
      // Pass location as route params when navigating
      navigation.navigate("Map", { location: location.coords });
    } else {
      setErrorMsg("Please grant location permission first.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Location Permission Screen</Text>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      <Button
        title="Grant Permission and Go to Map"
        onPress={handleNavigateToMap}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
  },
});

export default LocationPermissionScreen;
