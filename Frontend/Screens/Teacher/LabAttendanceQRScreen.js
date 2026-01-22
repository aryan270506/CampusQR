import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";

export default function LabAttendanceQRScreen({ route, navigation }) {
  const { year, division, batch, subject } = route.params;

  const [qrValue, setQrValue] = useState(null); // ✅ null, not ""

  // 🔁 Change QR every 3 seconds
  useEffect(() => {
    generateQR();
    const interval = setInterval(generateQR, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateQR = () => {
    const value = JSON.stringify({
      year,
      division,
      batch,
      subject,
      timestamp: Date.now(),
    });

    setQrValue(value); // ✅ always non-empty
  };

  const saveAttendance = async () => {
  const session = {
    id: Date.now().toString(),
    year,
    division,
    batch,
    subject,
    createdAt: Date.now(), // 🔥 important
  };

  const existing =
    JSON.parse(await AsyncStorage.getItem("labSessions")) || [];

  await AsyncStorage.setItem(
    "labSessions",
    JSON.stringify([session, ...existing])
  );

  Alert.alert("Saved", "Lab attendance saved successfully");

  // 🔁 GO BACK TO LAB ATTENDANCE SCREEN
  navigation.goBack();
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lab Attendance QR</Text>

      {/* ✅ Render QR only when value exists */}
      {qrValue && <QRCode value={qrValue} size={220} />}

      <View style={styles.infoBox}>
        <Text>{year}</Text>
        <Text>{division}</Text>
        <Text>{batch}</Text>
        <Text>{subject}</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
        <Text style={styles.saveText}>Save Attendance</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  infoBox: {
    marginTop: 20,
    alignItems: "center",
    gap: 4,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
