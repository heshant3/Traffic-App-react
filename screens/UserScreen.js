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
      setEditedPassword(userData.email); // Reset to original email
    } else if (field === "password") {
      setEditedPassword(userData.password); // Reset to original email
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
      <View style={styles.ImageContainer}>
        <FontAwesome name="user-circle" size={100} color="#888" />
      </View>
      {userData ? (
        <View style={styles.profileContainer}>
          <View style={styles.textContainer}>
            <View style={styles.editableRow}>
              {isEditing.name ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                  />
                  <TouchableOpacity
                    style={styles.Button}
                    onPress={() => handleSave("name")}
                  >
                    <AntDesign name="save" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.Button}
                    onPress={() => handleCancel("name")}
                  >
                    <MaterialIcons name="edit-off" size={24} color="#ff0000" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.text}>Name: {userData.name}</Text>
                  <AntDesign
                    name="edit"
                    size={24}
                    color="#007AFF"
                    onPress={() =>
                      setIsEditing((prev) => ({ ...prev, name: true }))
                    }
                  />
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
                    style={styles.Button}
                    onPress={() => handleSave("email")}
                  >
                    <AntDesign name="save" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.Button}
                    onPress={() => handleCancel("email")}
                  >
                    <MaterialIcons name="edit-off" size={24} color="#ff0000" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.text}>Email: {userData.email}</Text>
                  <AntDesign
                    name="edit"
                    size={24}
                    color="#007AFF"
                    onPress={() =>
                      setIsEditing((prev) => ({ ...prev, email: true }))
                    }
                  />
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
                  />
                  <TouchableOpacity
                    style={styles.Button}
                    onPress={() => handleSave("password")}
                  >
                    <AntDesign name="save" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.Button}
                    onPress={() => handleCancel("password")}
                  >
                    <MaterialIcons name="edit-off" size={24} color="#ff0000" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.text}>Password: {userData.password}</Text>
                  <AntDesign
                    name="edit"
                    size={24}
                    color="#007AFF"
                    onPress={() =>
                      setIsEditing((prev) => ({ ...prev, password: true }))
                    }
                  />
                </>
              )}
            </View>
          </View>
        </View>
      ) : (
        <Text>No user data available.</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    alignItems: "center",
    paddingTop: 50,
  },
  ImageContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  profileContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginBottom: 60,
  },
  textContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 40,
  },
  editableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 50,
  },
  text: {
    fontSize: 22,
    color: "#555",
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flex: 1,
    marginRight: 10,
  },
  Button: {
    marginLeft: 30,
  },
  logoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default UserScreen;
