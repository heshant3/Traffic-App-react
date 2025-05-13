import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { ref, push, onValue, remove, set } from "firebase/database";
import { db } from "../components/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const IncidentScreen = () => {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentType, setIncidentType] = useState("crash");
  const [incidents, setIncidents] = useState([]);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    // Listen for real-time updates
    const incidentsRef = ref(db, "incidents");
    const unsubscribe = onValue(incidentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const incidentList = Object.entries(data).map(([id, incident]) => ({
          id,
          ...incident,
        }));
        setIncidents(incidentList);
      } else {
        setIncidents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show your current location"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      if (mapRef) {
        mapRef.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {}
  };

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
  };

  const handleSaveIncident = async () => {
    if (!selectedLocation) {
      return;
    }

    try {
      const incidentsRef = ref(db, "incidents");
      const newIncidentRef = push(incidentsRef);

      await set(newIncidentRef, {
        type: incidentType,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        timestamp: new Date().toISOString(),
      });

      Alert.alert("Success", "Incident reported successfully");
      setShowMap(false);
      setShowIncidentForm(false);
      setSelectedLocation(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save incident");
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    try {
      const incidentRef = ref(db, `incidents/${incidentId}`);
      await remove(incidentRef);
      setShowIncidentDetails(false);
    } catch (error) {
      Alert.alert("Error", "Failed to delete incident");
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case "crash":
        return "warning-outline";
      case "flooding":
        return "water-outline";
      case "roadblock":
        return "alert-circle-outline";
      default:
        return "warning-outline";
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setShowMap(true);
          getCurrentLocation();
        }}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.buttonText}>Report Incident</Text>
      </TouchableOpacity>

      <ScrollView style={styles.incidentList}>
        {incidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            style={styles.incidentItem}
            onPress={() => {
              setSelectedIncident(incident);
              setShowIncidentDetails(true);
            }}
          >
            <Text style={styles.incidentType}>{incident.type}</Text>
            <Text style={styles.incidentDate}>
              {new Date(incident.timestamp).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Modal */}
      <Modal visible={showMap} animationType="slide">
        <View style={styles.modalContainer}>
          <MapView
            ref={(ref) => setMapRef(ref)}
            style={styles.map}
            onPress={handleMapPress}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={true}
            initialRegion={
              currentLocation
                ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }
                : undefined
            }
          >
            {selectedLocation && <Marker coordinate={selectedLocation} />}
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                pinColor="blue"
                title="Your Location"
              />
            )}
          </MapView>

          <View style={styles.mapButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="locate" size={24} color="white" />
            </TouchableOpacity>

            {selectedLocation && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowIncidentForm(true)}
              >
                <Text style={styles.buttonText}>Confirm Location</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMap(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Incident Form Modal */}
      <Modal visible={showIncidentForm} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.typeSelectionHeader}>
            <Text style={styles.typeSelectionTitle}>Select Incident Type</Text>
            <Text style={styles.typeSelectionSubtitle}>
              Choose the type of incident you want to report
            </Text>
          </View>

          <View style={styles.typeSelectionGrid}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                incidentType === "crash" && styles.selectedTypeButton,
              ]}
              onPress={() => setIncidentType("crash")}
            >
              <View style={styles.typeIconContainer}>
                <Ionicons
                  name="car-crash-outline"
                  size={32}
                  color={incidentType === "crash" ? "#fff" : "#3C80FF"}
                />
              </View>
              <Text
                style={[
                  styles.typeButtonText,
                  incidentType === "crash" && styles.selectedTypeText,
                ]}
              >
                Crash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                incidentType === "flooding" && styles.selectedTypeButton,
              ]}
              onPress={() => setIncidentType("flooding")}
            >
              <View style={styles.typeIconContainer}>
                <Ionicons
                  name="water-outline"
                  size={32}
                  color={incidentType === "flooding" ? "#fff" : "#3C80FF"}
                />
              </View>
              <Text
                style={[
                  styles.typeButtonText,
                  incidentType === "flooding" && styles.selectedTypeText,
                ]}
              >
                Flooding
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                incidentType === "roadblock" && styles.selectedTypeButton,
              ]}
              onPress={() => setIncidentType("roadblock")}
            >
              <View style={styles.typeIconContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color={incidentType === "roadblock" ? "#fff" : "#3C80FF"}
                />
              </View>
              <Text
                style={[
                  styles.typeButtonText,
                  incidentType === "roadblock" && styles.selectedTypeText,
                ]}
              >
                Roadblock
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.typeSelectionActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveIncident}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="white"
              />
              <Text style={styles.actionButtonText}>Save Incident</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={() => setShowIncidentForm(false)}
            >
              <Ionicons name="close-circle-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Incident Details Modal */}
      <Modal visible={showIncidentDetails} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedIncident && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailsHeader}>
                <Ionicons
                  name={getIncidentIcon(selectedIncident.type)}
                  size={40}
                  color="#3C80FF"
                />
                <Text style={styles.detailsTitle}>
                  {capitalizeFirstLetter(selectedIncident.type)} Incident
                </Text>
              </View>

              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={24} color="#666" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Reported Time</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedIncident.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={24} color="#666" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {selectedIncident.latitude.toFixed(4)},{" "}
                      {selectedIncident.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>

                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.detailsMap}
                    initialRegion={{
                      latitude: selectedIncident.latitude,
                      longitude: selectedIncident.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: selectedIncident.latitude,
                        longitude: selectedIncident.longitude,
                      }}
                      pinColor="#3C80FF"
                    />
                  </MapView>
                </View>
              </View>

              <View style={styles.detailsActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteIncident(selectedIncident.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="white" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.closeButton]}
                  onPress={() => setShowIncidentDetails(false)}
                >
                  <Ionicons name="close-outline" size={24} color="white" />
                  <Text style={styles.actionButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    backgroundColor: "#3C80FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  incidentList: {
    flex: 1,
    padding: 10,
  },
  incidentItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incidentDate: {
    color: "#666",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "flex-end",
  },
  locationButton: {
    backgroundColor: "#3C80FF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: "#3C80FF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    width: 150,
  },
  closeButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    width: 150,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  picker: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#3C80FF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailsHeader: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
  },
  detailTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  mapContainer: {
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  detailsMap: {
    flex: 1,
  },
  detailsActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#FF3C3C",
  },
  typeSelectionHeader: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  typeSelectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  typeSelectionSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  typeSelectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "space-between",
  },
  typeButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
    elevation: 2,
  },
  selectedTypeButton: {
    backgroundColor: "#3C80FF",
    borderColor: "#3C80FF",
  },
  typeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedTypeText: {
    color: "#fff",
  },
  typeSelectionActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#3C80FF",
  },
});

export default IncidentScreen;
