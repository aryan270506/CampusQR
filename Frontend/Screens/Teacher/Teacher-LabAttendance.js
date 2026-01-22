import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function LabAttendance({ navigation }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [recentLabs, setRecentLabs] = useState([]);


  // 🔹 Dummy frontend data
  const classes = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sections = ["Div A", "Div B", "Div C"];
  const batches = ["Batch 1", "Batch 2", "Batch 3"];
  const subjects = ["DS Lab", "DBMS Lab", "OS Lab", "CN Lab"];

  const handleSubmit = () => {
  if (!selectedClass || !selectedSection || !selectedBatch || !selectedSubject) {
    alert("Please select Year, Division, Batch and Subject");
    return;
  }

  navigation.navigate("LabAttendanceQRScreen", {
    year: selectedClass,
    division: selectedSection,
    batch: selectedBatch,
    subject: selectedSubject,
  });
};

useFocusEffect(
  useCallback(() => {
    loadRecentLabs();
  }, [])
);

const loadRecentLabs = async () => {
  const stored =
    JSON.parse(await AsyncStorage.getItem("labSessions")) || [];

  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  const filtered = stored.filter(
    (s) => s.createdAt >= oneHourAgo
  );

  setRecentLabs(filtered);
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Lab Attendance</Text>
        <Text style={styles.subtitle}>Select Year, Division, Batch & Subject</Text>

        {/* YEAR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Year</Text>
          <View style={styles.classGrid}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[
                  styles.classButton,
                  selectedClass === cls && styles.selectedButton,
                ]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedClass === cls && styles.selectedButtonText,
                  ]}
                >
                  {cls}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DIVISION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Division</Text>
          <View style={styles.sectionGrid}>
            {sections.map((section) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.sectionButton,
                  selectedSection === section && styles.selectedButton,
                ]}
                onPress={() => setSelectedSection(section)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedSection === section && styles.selectedButtonText,
                  ]}
                >
                  {section.split(" ")[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BATCH */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Batch</Text>
          <View style={styles.sectionGrid}>
            {batches.map((batch) => (
              <TouchableOpacity
                key={batch}
                style={[
                  styles.sectionButton,
                  selectedBatch === batch && styles.selectedButton,
                ]}
                onPress={() => setSelectedBatch(batch)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedBatch === batch && styles.selectedButtonText,
                  ]}
                >
                  {batch.split(" ")[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUBJECT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Subject</Text>
          <View style={styles.subjectGrid}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectButton,
                  selectedSubject === subject && styles.selectedButton,
                ]}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedSubject === subject && styles.selectedButtonText,
                  ]}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionLabel}>Your Selection:</Text>
          <Text style={styles.selectionText}>
            {selectedClass || "-"} - {selectedSection || "-"} -{" "}
            {selectedBatch || "-"} - {selectedSubject || "-"}
          </Text>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Confirm Lab Attendance</Text>
        </TouchableOpacity>

        {recentLabs.length > 0 && (
  <>
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>RECENT LABS</Text>
      <View style={styles.dividerLine} />
    </View>

    <View style={styles.recentsGrid}>
      {recentLabs.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.recentCard}
          onPress={() =>
            navigation.navigate("EditLabAttendanceScreen", {
              session: item,
            })
          }
        >
          <View>
            <Text style={styles.recentClass}>
              {item.year} • {item.division}
            </Text>
            <Text style={styles.recentSub}>
              {item.batch} • {item.subject}
            </Text>
          </View>

          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      ))}
    </View>
  </>
)}


        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginTop: 20,
  },
  /* ===== RECENT LABS ===== */

divider: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 30,
},

dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: "#e2e8f0",
},

dividerText: {
  marginHorizontal: 16,
  fontSize: 12,
  fontWeight: "700",
  color: "#94a3b8",
  letterSpacing: 1,
},

recentsGrid: {
  gap: 12,
},

recentCard: {
  backgroundColor: "#ffffff",
  padding: 16,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderWidth: 1,
  borderColor: "#e2e8f0",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
},

recentClass: {
  fontSize: 16,
  fontWeight: "600",
  color: "#334155",
},

recentSub: {
  fontSize: 14,
  color: "#64748b",
  marginTop: 2,
},

editText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#4f46e5",
},

  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
  },
  classGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sectionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  classButton: {
    width: "48%",
    backgroundColor: "#e2e8f0",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  sectionButton: {
    width: "30%",
    backgroundColor: "#e2e8f0",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  subjectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  subjectButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
  },
  selectedButton: { backgroundColor: "#4f46e5" },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  selectedButtonText: { color: "#ffffff" },
  selectionInfo: {
    backgroundColor: "#eef2ff",
    padding: 16,
    borderRadius: 12,
  },
  selectionLabel: { fontSize: 14, color: "#64748b" },
  selectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f46e5",
  },
  submitButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
