import React, { useEffect, useState, useRef } from "react";
import { Alert } from "react-native";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

const NotificationHandler = () => {
  const [crashData, setCrashData] = useState(false);
  const [floodingData, setFloodingData] = useState(false);
  const [roadblockData, setRoadblockData] = useState(false);

  // Use refs to track alert status instead of state
  const alertShownRef = useRef({
    crash: false,
    flooding: false,
    roadblock: false,
  });

  // Monitor traffic conditions
  useEffect(() => {
    // Listen to traffic status paths
    const trafficCrashRef = ref(db, "/traffic/crash");
    const unsubscribeCrash = onValue(trafficCrashRef, (snapshot) => {
      const crashStatus = snapshot.val();
      setCrashData(crashStatus);
    });

    const trafficFloodingRef = ref(db, "/traffic/flooding");
    const unsubscribeFlooding = onValue(trafficFloodingRef, (snapshot) => {
      const floodingStatus = snapshot.val();
      setFloodingData(floodingStatus);
    });

    const trafficRoadblockRef = ref(db, "/traffic/roadblock");
    const unsubscribeRoadblock = onValue(trafficRoadblockRef, (snapshot) => {
      const roadblockStatus = snapshot.val();
      setRoadblockData(roadblockStatus);
    });

    // Cleanup
    return () => {
      unsubscribeCrash();
      unsubscribeFlooding();
      unsubscribeRoadblock();
    };
  }, []); // Empty dependency array - only run on mount

  // Monitor incidents and show alerts
  useEffect(() => {
    // Listen to all incidents
    const incidentsRef = ref(db, "/incidents");
    const unsubscribeIncidents = onValue(incidentsRef, (snapshot) => {
      const incidents = snapshot.val();
      if (!incidents) return;

      // Check for different incident types
      let crashFound = false;
      let floodingFound = false;
      let roadblockFound = false;

      Object.keys(incidents).forEach((incidentId) => {
        const incident = incidents[incidentId];
        if (incident) {
          if (incident.type === "crash") crashFound = true;
          if (incident.type === "flooding") floodingFound = true;
          if (incident.type === "roadblock") roadblockFound = true;
        }
      });

      // Show alerts based on conditions
      if (crashData && crashFound && !alertShownRef.current.crash) {
        Alert.alert(
          "Traffic Alert",
          "A crash has been detected. Please be cautious.",
          [
            {
              text: "OK",
              onPress: () => {
                alertShownRef.current = {
                  ...alertShownRef.current,
                  crash: true,
                };
              },
            },
          ]
        );
      } else if (!crashFound) {
        // Reset alert status when no crash incidents exist
        alertShownRef.current = { ...alertShownRef.current, crash: false };
      }

      if (floodingData && floodingFound && !alertShownRef.current.flooding) {
        Alert.alert(
          "Flooding Alert",
          "Flooding has been detected in your area. Please take alternate routes.",
          [
            {
              text: "OK",
              onPress: () => {
                alertShownRef.current = {
                  ...alertShownRef.current,
                  flooding: true,
                };
              },
            },
          ]
        );
      } else if (!floodingFound) {
        // Reset alert status when no flooding incidents exist
        alertShownRef.current = { ...alertShownRef.current, flooding: false };
      }

      if (roadblockData && roadblockFound && !alertShownRef.current.roadblock) {
        Alert.alert(
          "Roadblock Alert",
          "A roadblock has been detected. Please take alternate routes.",
          [
            {
              text: "OK",
              onPress: () => {
                alertShownRef.current = {
                  ...alertShownRef.current,
                  roadblock: true,
                };
              },
            },
          ]
        );
      } else if (!roadblockFound) {
        // Reset alert status when no roadblock incidents exist
        alertShownRef.current = { ...alertShownRef.current, roadblock: false };
      }
    });

    // Cleanup
    return () => {
      unsubscribeIncidents();
    };
  }, [crashData, floodingData, roadblockData]); // Only depend on the condition states

  return null; // This component doesn't render anything
};

export default NotificationHandler;
