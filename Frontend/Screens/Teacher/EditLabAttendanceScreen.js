import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";

export default function EditLabAttendanceScreen({ route, navigation }) {
  const { session } = route.params;

  const [students, setStudents] = useState([]);
  const [updating, setUpdating] = useState(false);

  // 🔒 1 hour edit lock
  const isExpired = Date.now() - session.createdAt > 60 * 60 * 1000;

  // 🔹 Dummy students (frontend only)
  useEffect(() => {
    const dummyStudents = Array.from({ length: 24 }).map((_, i) => ({
      studentId: `STU${i + 1}`,
      rollNo: String(i + 1).padStart(3, "0"),
      name: `Student ${i + 1}`,
      status: Math.random() > 0.3 ? "present" : "absent",
    }));

    setStudents(dummyStudents);
  }, []);

  const toggleAttendance = (studentId) => {
    if (isExpired) {
      Alert.alert("Edit Locked", "Editing is allowed only within 1 hour");
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s
      )
    );
  };

  const handleMarkAllPresent = () => {
    if (isExpired) return;

    setStudents((prev) =>
      prev.map((s) => ({ ...s, status: "present" }))
    );
  };

  const handleMarkAllAbsent = () => {
    if (isExpired) return;

    setStudents((prev) =>
      prev.map((s) => ({ ...s, status: "absent" }))
    );
  };

  const getPresentCount = () =>
    students.filter((s) => s.status === "present").length;

  const getAbsentCount = () =>
    students.filter((s) => s.status === "absent").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Edit Lab Attendance</Text>
          <Text style={styles.headerSubtitle}>
            {session.year} - {session.division}
          </Text>
          <Text style={styles.dateText}>
            {new Date(session.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statBox, styles.presentBox]}>
          <Text style={[styles.statNumber, styles.presentText]}>
            {getPresentCount()}
          </Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>

        <View style={[styles.statBox, styles.absentBox]}>
          <Text style={[styles.statNumber, styles.absentText]}>
            {getAbsentCount()}
          </Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            isExpired && styles.disabledButton,
          ]}
          onPress={handleMarkAllPresent}
          disabled={isExpired}
        >
          <Text style={styles.quickActionText}>Mark All Present</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionButton,
            styles.quickActionButtonSecondary,
            isExpired && styles.disabledButton,
          ]}
          onPress={handleMarkAllAbsent}
          disabled={isExpired}
        >
          <Text style={styles.quickActionTextSecondary}>Mark All Absent</Text>
        </TouchableOpacity>
      </View>

      {/* Student List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {students.map((student) => (
          <View key={student.studentId} style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <View style={styles.rollNoContainer}>
                <Text style={styles.rollNo}>{student.rollNo}</Text>
              </View>
              <Text style={styles.studentName}>{student.name}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.statusButton,
                student.status === "present"
                  ? styles.presentButton
                  : styles.absentButton,
                isExpired && styles.disabledButton,
              ]}
              onPress={() => toggleAttendance(student.studentId)}
              disabled={isExpired}
            >
              <Text
                style={[
                  styles.statusText,
                  student.status === "present"
                    ? styles.presentStatusText
                    : styles.absentStatusText,
                ]}
              >
                {student.status === "present" ? "Present" : "Absent"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isExpired && styles.disabledButton,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveButtonText}>
            {isExpired ? "Edit Locked" : "Done"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  presentBox: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
  },
  absentBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  presentText: {
    color: '#16a34a',
  },
  absentText: {
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionTextSecondary: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
    marginTop: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rollNoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rollNo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  presentButton: {
    backgroundColor: '#dcfce7',
  },
  absentButton: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  presentStatusText: {
    color: '#16a34a',
  },
  absentStatusText: {
    color: '#dc2626',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
