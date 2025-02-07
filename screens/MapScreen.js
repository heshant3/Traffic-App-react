import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Ionicons, MaterialIcons, FontAwesome6 } from "@expo/vector-icons";

const MapScreen = ({ route }) => {
  const [location, setLocation] = useState(route.params?.location || null);
  const [searchText, setSearchText] = useState("");
  const [searchLocation, setSearchLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const GOOGLE_API_KEY = " AIzaSyBmayTJP8fXnkAiZdyCjV3kvPqiT3_T0_M";

  useEffect(() => {
    if (!location) {
      getCurrentLocation();
    } else {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (location && searchLocation) {
      // Re-fetch directions
    }
  }, [location, searchLocation]);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      setLoading(false);
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setLoading(false);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const onSearchSelect = (data, details = null) => {
    if (!details) return;

    const { lat, lng } = details.geometry.location;
    setSearchLocation({ latitude: lat, longitude: lng });

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const fetchDirections = async () => {
    if (!location || !searchLocation) return;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${searchLocation.latitude},${searchLocation.longitude}&key=${GOOGLE_API_KEY}`;

    try {
      let response = await fetch(url);
      let data = await response.json();

      if (data.routes.length > 0) {
        let points = decodePolyline(data.routes[0].overview_polyline.points);
        setDirections(points);
      }
    } catch (error) {
      alert.error("Error fetching directions:", error);
    }
  };

  const decodePolyline = (polyline) => {
    let points = [];
    let index = 0,
      len = polyline.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let shift = 0,
        result = 0;
      let byte;
      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchLocation(null);
    setDirections(null);
    inputRef.current?.setAddressText("");
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading map...</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <GooglePlacesAutocomplete
              ref={inputRef}
              placeholder="Search for a location"
              onPress={onSearchSelect}
              fetchDetails={true}
              query={{ key: GOOGLE_API_KEY, language: "en" }}
              textInputProps={{
                value: searchText,
                onChangeText: (text) => setSearchText(text),
              }}
              styles={{
                textInput: styles.searchInput,
                container: { flex: 1 },
                listView: styles.searchResults,
              }}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Ionicons name="close-circle" size={24} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={false}
            trafficEnabled={true}
            ref={mapRef}
            initialRegion={{
              latitude: location?.latitude || 37.78825,
              longitude: location?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {searchLocation && (
              <Marker coordinate={searchLocation} title="Selected Location" />
            )}
            {directions && (
              <Polyline
                coordinates={directions}
                strokeWidth={5}
                strokeColor="blue"
              />
            )}
          </MapView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <MaterialIcons
                name="my-location"
                size={24}
                style={styles.buttonText}
              />
            </TouchableOpacity>
            {searchLocation && (
              <TouchableOpacity
                style={styles.directionButton}
                onPress={fetchDirections}
              >
                <FontAwesome6
                  name="location-arrow"
                  size={24}
                  style={styles.buttonText}
                />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  map: { ...StyleSheet.absoluteFillObject },
  buttonContainer: { position: "absolute", bottom: 20, right: 20, zIndex: 1 },
  locationButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    marginBottom: 10,
  },
  directionButton: {
    backgroundColor: "#3C80FF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingRight: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  searchInput: {
    top: 2,
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  searchResults: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 9,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default MapScreen;
