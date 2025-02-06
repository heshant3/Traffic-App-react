import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { db } from "../components/firebase"; // Import Realtime Database
import { ref, get } from "firebase/database"; // Methods for Realtime Database

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Reference to the users data in Realtime Database
      const usersRef = ref(db, "users");

      // Get all users and check if the email and password match
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        let userFound = false;
        let userId = null;

        // Loop through the users and check for email and password match
        for (const id in usersData) {
          const user = usersData[id];

          if (user.email === email && user.password === password) {
            userFound = true;
            userId = id;
            break;
          }
        }

        if (userFound) {
          Alert.alert("Success", "Login successful!");
          navigation.navigate("Main", { screen: "User", params: { userId } }); // Navigate to User screen with userId
        } else {
          Alert.alert("Error", "Invalid email or password.");
        }
      } else {
        Alert.alert("Error", "No users found.");
      }
    } catch (error) {
      Alert.alert("Error", error.message); // Display other errors
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {isLoading ? "Logging ..." : "Login"}
        </Text>
      </TouchableOpacity>
      <View style={styles.signup}>
        <Text>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.linkText}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    width: "80%",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  linkText: {
    color: "#007AFF",
  },
  signup: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
