import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { db } from "../components/firebase"; // Import Firebase db
import { ref, get, update } from "firebase/database"; // Firebase Realtime Database imports
import {
  FontAwesome,
  AntDesign,
  MaterialIcons,
} from "react-native-vector-icons"; // Added MaterialIcons

const UserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle errors
  const [isEditing, setIsEditing] = useState({ name: false, email: false }); // State to track editing
  const [editedName, setEditedName] = useState(""); // State for edited name
  const [editedEmail, setEditedEmail] = useState(""); // State for edited email
  const [editedPassword, setEditedPassword] = useState(""); // State for edited email

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userRef = ref(db, "users/" + userId);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData(data);
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          setError("Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No user ID provided.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = async () => {
    try {
      Alert.alert("Success", "You have been logged out.");
      navigation.replace("Login"); // Redirect to login screen
    } catch (err) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const handleSave = async (field) => {
    try {
      const userRef = ref(db, "users/" + userId); // Realtime Database reference

      if (field === "name") {
        await update(userRef, { name: editedName });
        setUserData((prev) => ({ ...prev, name: editedName }));
      } else if (field === "email") {
        await update(userRef, { email: editedEmail });
        setUserData((prev) => ({ ...prev, email: editedEmail }));
      } else if (field === "password") {
        await update(userRef, { password: editedPassword });
        setUserData((prev) => ({ ...prev, password: editedPassword }));
      }

      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (err) {
      Alert.alert("Error", `Failed to update ${field}. Please try again.`, [
        { text: "OK", onPress: () => console.error(err) },
      ]);
    }
  };

  const handleCancel = (field) => {
    if (field === "name") {
      setEditedName(userData.name); // Reset to original name
    } else if (field === "email") {
      setEditedEmail(userData.email); // Reset to original email
    } else if (field === "password") {
      setEditedPassword(userData.password); // Reset to original password
    }

    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBackground}>
          <FontAwesome name="user-circle" size={30} color="#ffffff" />
        </View>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      <View style={styles.profileContainer}>
        {userData ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <View style={styles.editableRow}>
                {isEditing.name ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editedName}
                      onChangeText={setEditedName}
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSave("name")}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancel("name")}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.text}>Full Name: {userData.name}</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        setIsEditing((prev) => ({ ...prev, name: true }))
                      }
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <View style={styles.editableRow}>
                {isEditing.email ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editedEmail}
                      onChangeText={setEditedEmail}
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSave("email")}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancel("email")}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.text}>
                      Email Address: {userData.email}
                    </Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        setIsEditing((prev) => ({ ...prev, email: true }))
                      }
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <View style={styles.editableRow}>
                {isEditing.password ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editedPassword}
                      onChangeText={setEditedPassword}
                      secureTextEntry
                      placeholder="Enter new password"
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSave("password")}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancel("password")}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.text}>Password: ******</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        setIsEditing((prev) => ({ ...prev, password: true }))
                      }
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>No user data available.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconBackground: {
    width: 70,
    height: 70,
    backgroundColor: "#ffffff5f",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  profileContainer: {
    backgroundColor: "#ffffff",
    width: "85%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    width: "100%",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  editableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: "#555",
    flex: 1,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 10,
    backgroundColor: "#F9F9F9",
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#007AFF",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserScreen;
