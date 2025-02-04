import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "react-native-vector-icons";

// Import your screens
import MapScreen from "./screens/MapScreen";
import ForecastScreen from "./screens/ForecastScreen";
import UserScreen from "./screens/UserScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator for the app
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Forecast") {
            iconName = focused ? "cloud" : "cloud-outline";
          } else if (route.name === "User") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#f8f8f8",
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Forecast" component={ForecastScreen} />
      <Tab.Screen name="User" component={UserScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Login and Signup Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Main Tabs after login */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
