import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { auth, db } from "../components/firebase"; // Import Firebase auth and db
import { doc, getDoc } from "firebase/firestore";
import { FontAwesome } from "react-native-vector-icons";

const UserScreen = () => {
  const [userData, setUserData] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; // Get the currently logged-in user
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data()); // Set user data if the document exists
          } else {
            console.log("No such document!"); // Log if the document does not exist
            setError("User data not found."); // Set an error message for the UI
          }
        } catch (err) {
          console.error("Error fetching user data:", err); // Log any errors
          setError("Failed to fetch user data."); // Set an error message for the UI
        } finally {
          setLoading(false); // Stop loading regardless of success or failure
        }
      } else {
        setError("No user is currently logged in."); // Handle case where no user is logged in
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
      <FontAwesome name="user-circle" size={100} color="#888" />;
      {userData ? (
        <View style={styles.profileContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>Name: {userData.name}</Text>
            <Text style={styles.text}>Email: {userData.email}</Text>
          </View>
        </View>
      ) : (
        <Text>No user data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    alignItems: "center", // Align items to the left
    paddingTop: 50, // Add top padding for status bar or header
  },
  profileContainer: {
    flexDirection: "column", // Arrange items vertically
    alignItems: "center", // Align items to the left within the container
    width: "100%", // Ensure the container takes full width
    textAlign: "left", // Align text to the left
  },
  textContainer: {
    width: "100%", // Make sure the text container takes full width
    alignItems: "flex-start", // Align text to the left
    marginTop: 40, // Add some margin at the
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
    alignSelf: "center", // Center the title horizontally
    marginBottom: 30, // Increased margin below title
  },
  text: {
    fontSize: 22,
    marginBottom: 20,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 10,
  },
});

export default UserScreen;
