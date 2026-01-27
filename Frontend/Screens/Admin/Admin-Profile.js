import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { ref, get } from "firebase/database";
import { db } from "../firebase"; // path may change
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { disconnectSocket } from "../../src/services/socket";
import api from "../../src/utils/axios";
import { ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";





export default function AdminProfile() {
  const navigation = useNavigation();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
  try {
    setLoading(true);

    const adminId = await AsyncStorage.getItem("adminId");
    if (!adminId) {
      throw new Error("Admin ID not found");
    }

    const res = await api.get(`/api/admin/me/${adminId}`);

    // ✅ ALL DATA COMES FROM MONGO
    setAdmin(res.data);

  } catch (err) {
    console.error("❌ Admin profile error:", err);
    Alert.alert("Error", "Failed to load admin profile");
  } finally {
    setLoading(false);
  }
};

const handleUploadTeachers = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];

    if (!file.name.endsWith(".json")) {
      Alert.alert("Invalid File", "Only JSON files are allowed");
      return;
    }

    const response = await fetch(file.uri);
    const text = await response.text();

    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch {
      Alert.alert("Invalid JSON", "File is not valid JSON");
      return;
    }

    const res = await api.post(
      "/api/admin/upload-teachers",
      jsonData,
      { headers: { "Content-Type": "application/json" } }
    );

    Alert.alert(
      "Upload Successful",
      `${res.data.count} teachers uploaded successfully`
    );

  } catch (err) {
    console.error("❌ Teacher upload error:", err);
    Alert.alert("Error", "Failed to upload teachers");
  }
};



const handleUploadAdmins = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];

    if (!file.name.endsWith(".json")) {
      Alert.alert("Invalid File", "Only JSON files are allowed");
      return;
    }

    const response = await fetch(file.uri);
    const text = await response.text();

    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch {
      Alert.alert("Invalid JSON", "File is not valid JSON");
      return;
    }

    const res = await api.post(
      "/api/admin/upload-admins",
      jsonData,
      { headers: { "Content-Type": "application/json" } }
    );

    Alert.alert(
      "Upload Successful",
      `${res.data.count} admins uploaded successfully`
    );

  } catch (err) {
    console.error("❌ Admin upload error:", err);
    Alert.alert("Error", "Failed to upload admins");
  }
};


const handleUploadStudents = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets[0];

    // ✅ Enforce JSON only
    if (!file.name.endsWith(".json")) {
      Alert.alert("Invalid File", "Only JSON files are allowed");
      return;
    }

    // ✅ Read file content (works on all platforms)
    const response = await fetch(file.uri);
    const text = await response.text();

    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch (e) {
      Alert.alert("Invalid JSON", "File is not valid JSON");
      return;
    }

    // ✅ Upload to backend
    const res = await api.post(
      "/api/admin/upload-students",
      jsonData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    Alert.alert(
      "Upload Successful",
      `${res.data.count} students uploaded successfully`
    );

  } catch (err) {
    console.error("❌ Upload error:", err);
    Alert.alert("Error", "Failed to upload students");
  }
};


const handleUploadParents = async () => {
  console.log("🟢 handleUploadParents CALLED");
  
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    console.log("📁 File picker result:", result);

    if (result.canceled) {
      console.log("⚠️ File picker canceled");
      return;
    }

    const file = result.assets[0];
    console.log("📄 Selected file:", file.name);

    // ✅ Enforce JSON only
    if (!file.name.endsWith(".json")) {
      console.log("❌ Invalid file type:", file.name);
      Alert.alert("Invalid File", "Only JSON files are allowed");
      return;
    }

    // ✅ Read file content (works on all platforms)
    console.log("📖 Reading file from URI:", file.uri);
    const response = await fetch(file.uri);
    const text = await response.text();
    console.log("📝 File content length:", text.length);

    let jsonData;
    try {
      jsonData = JSON.parse(text);
      console.log("✅ JSON parsed successfully");
      console.log("📊 Data type:", typeof jsonData);
      console.log("📊 Is Array:", Array.isArray(jsonData));
      console.log("📊 Array length:", jsonData?.length);
      console.log("📊 First item:", jsonData?.[0]);
    } catch (e) {
      console.log("❌ JSON parse error:", e);
      Alert.alert("Invalid JSON", "File is not valid JSON");
      return;
    }

    // ⚠️ WARNING CONFIRMATION (since old parents get deleted)
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Uploading parents will DELETE all existing parents. Continue?"
      );
      
      if (!confirmed) {
        console.log("⚠️ Upload canceled by user");
        return;
      }

      // Upload immediately for web
      try {
        console.log("🚀 Sending POST request to /api/admin/upload-parents");
        console.log("📦 Payload:", jsonData);
        
        const res = await api.post(
          "/api/admin/upload-parents",
          jsonData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Upload response:", res.data);

        window.alert(
          `Upload Successful\n${res.data.count} parents uploaded successfully`
        );
      } catch (err) {
        console.error("❌ Parent upload error:", err);
        console.error("❌ Error response:", err?.response?.data);
        console.error("❌ Error message:", err?.message);
        
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Upload failed";

        window.alert(`Upload Failed\n${message}`);
      }
    } else {
      // Mobile flow with Alert
      Alert.alert(
        "Confirm Upload",
        "Uploading parents will DELETE all existing parents. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upload",
            style: "destructive",
            onPress: async () => {
              try {
                console.log("🚀 Sending POST request to /api/admin/upload-parents");
                
                const res = await api.post(
                  "/api/admin/upload-parents",
                  jsonData,
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                console.log("✅ Upload response:", res.data);

                Alert.alert(
                  "Upload Successful",
                  `${res.data.count} parents uploaded successfully`
                );
              } catch (err) {
                console.error("❌ Parent upload error:", err);
                console.error("❌ Error response:", err?.response?.data);
                
                const message =
                  err?.response?.data?.message ||
                  err?.response?.data?.error ||
                  err.message ||
                  "Upload failed";

                Alert.alert("Upload Failed", message);
              }
            },
          },
        ]
      );
    }

  } catch (err) {
    console.error("❌ Upload error (outer try):", err);
    
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      "Upload failed";

    if (Platform.OS === "web") {
      window.alert(`Upload Failed\n${message}`);
    } else {
      Alert.alert("Upload Failed", message);
    }
  }
};


  // Remove handleLogout() entirely and use only this:
const confirmLogout = () => {
  if (Platform.OS === "web") {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logoutAdmin();
    }
  } else {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: logoutAdmin,
        },
      ]
    );
  }
};

const logoutAdmin = async () => {
  try {
    const adminName = admin?.email
      ? admin.email.split('@')[0]
      : admin?.id || 'Unknown Admin';

    console.log(`🚪 ADMIN logged out: ${adminName}`);

    // 1️⃣ Clear AsyncStorage FIRST
    await AsyncStorage.multiRemove([
      "adminId",
      "userType",
    ]);

    // 2️⃣ Disconnect socket
    try {
      disconnectSocket();
    } catch (e) {
      console.warn("Socket disconnect failed:", e);
    }

    // 3️⃣ API logout
    try {
      await api.post("/api/users/logout", {
        userId: admin?.id,
      });
    } catch (e) {
      console.warn("Logout API failed:", e);
    }

    // 4️⃣ For web: force reload
    if (Platform.OS === "web") {
      window.location.href = "/"; // Force full page reload
      return;
    }

    // 5️⃣ For mobile: reset to Login
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );

  } catch (err) {
    console.error("Logout error:", err);
    Alert.alert("Error", "Failed to logout. Please try again.");
  }
};



  const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            const adminName =
              admin?.email
                ? admin.email.split('@')[0]
                : admin?.id || 'Unknown Admin';

            // ✅ LOGOUT LOG
            console.log(`🚪 ADMIN logged out: ${adminName}`);

            // 🔥 END SESSION COMPLETELY
            await AsyncStorage.multiRemove([
              'userType',
              'adminId',
            ]);

            // 🔁 RESET NAVIGATION STACK → LOGIN
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          } catch (error) {
            console.error('Admin logout error:', error);
          }
        },
      },
    ]
  );
};

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!admin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load admin data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAdminData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
  {admin.name
    ? admin.name.substring(0, 2).toUpperCase()
    : "AD"}
</Text>

        </View>
        <Text style={styles.name}>
          {admin.email ? admin.email.split('@')[0] : 'Admin User'}
        </Text>
        <Text style={styles.role}>Administrator</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.card}>
        <ProfileRow label="Branch" value={admin.branch || 'All Branches'} />
        <ProfileRow label="Email" value={admin.email || 'N/A'} />
        <ProfileRow label="Admin ID" value={admin.id || 'N/A'} />
      </View>

      {/* Upload Data Section */}
    <View style={styles.uploadSection}>
      <Text style={styles.sectionTitle}>Upload Data</Text>

      <TouchableOpacity
        style={styles.uploadCard}
        onPress={handleUploadStudents}

      >
        <Text style={styles.uploadTitle}>Upload Students</Text>
        <Text style={styles.uploadSubtitle}>CSV / Excel / JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.uploadCard}
        onPress={handleUploadTeachers}
      >
        <Text style={styles.uploadTitle}>Upload Teachers</Text>
        <Text style={styles.uploadSubtitle}>CSV / Excel / JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.uploadCard}
        onPress={handleUploadAdmins}

      >
        <Text style={styles.uploadTitle}>Upload Admins</Text>
        <Text style={styles.uploadSubtitle}>CSV / Excel / JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.uploadCard}
        onPress={handleUploadParents}

      >
        <Text style={styles.uploadTitle}>Upload Parents</Text>
        <Text style={styles.uploadSubtitle}>CSV / Excel / JSON</Text>
      </TouchableOpacity>
    </View>

      {/* Logout Button */}
      <TouchableOpacity
  style={styles.logoutButton}
  onPress={confirmLogout}
>
  <Text style={styles.logoutText}>Logout</Text>
  
</TouchableOpacity>




</ScrollView>

    </SafeAreaView>
  );
}

/* Small reusable row */
const ProfileRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },

  role: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },

  row: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },

  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  uploadSection: {
  marginBottom: 30,
},

sectionTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: 12,
},

uploadCard: {
  backgroundColor: "#ffffff",
  borderRadius: 14,
  padding: 18,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#e2e8f0",
},

uploadTitle: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1e293b",
},

uploadSubtitle: {
  fontSize: 13,
  color: "#64748b",
  marginTop: 4,
},

});