import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  alert,
  Platform,
  StatusBar,
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

  const GOOGLE_API_KEY = "AIzaSyAsnMMAVhA_ADVwTfwVNZFJD2Ydt0Xi9gs";

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <GooglePlacesAutocomplete
              ref={inputRef}
              placeholder="Search for a location"
              onPress={onSearchSelect}
              fetchDetails={true}
              query={{
                key: GOOGLE_API_KEY,
                language: "en",
                types: "geocode|establishment",
              }}
              textInputProps={{
                value: searchText,
                onChangeText: (text) => setSearchText(text),
                autoFocus: true,
              }}
              styles={{
                textInput: styles.searchInput,
                container: {
                  flex: 0,
                  position: "absolute",
                  width: "100%",
                  zIndex: 1,
                },
                listView: {
                  position: "absolute",
                  top: 45,
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 15,
                  zIndex: 1000,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                },
                row: {
                  backgroundColor: "#fff",
                  padding: 15,
                  height: 50,
                  flexDirection: "row",
                },
                separator: {
                  height: 0.5,
                  backgroundColor: "#f0f0f0",
                },
                description: {
                  fontSize: 16,
                  color: "#333",
                },
                poweredContainer: {
                  display: "none",
                },
              }}
              enablePoweredByContainer={false}
              minLength={2}
              debounce={300}
              nearbyPlacesAPI="GooglePlacesSearch"
              GooglePlacesDetailsQuery={{
                fields: "geometry",
              }}
            />
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
              <Marker
                coordinate={searchLocation}
                title="Selected Location"
                pinColor="#007AFF"
              />
            )}
            {directions && (
              <Polyline
                coordinates={directions}
                strokeWidth={4}
                strokeColor="#007AFF"
                lineDashPattern={[1]}
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
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1,
    gap: 15,
  },
  locationButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    right: 20,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInput: {
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#fff",
    flex: 1,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default MapScreen;
