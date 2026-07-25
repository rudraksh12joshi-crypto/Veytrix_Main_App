import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

interface Session {
  id: string;
  device: string;
  platform: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ActiveSessionsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  // Mock sessions
  const [sessions, setSessions] = useState<Session[]>([
    { id: "s1", device: "iPhone 15 Pro", platform: "iOS 17.2", location: "Mumbai, India", lastActive: "Active now", isCurrent: true },
    { id: "s2", device: "MacBook Pro", platform: "macOS 14.1", location: "Mumbai, India", lastActive: "2 hours ago", isCurrent: false },
    { id: "s3", device: "Windows PC", platform: "Windows 11", location: "Delhi, India", lastActive: "3 days ago", isCurrent: false },
  ]);

  const [isSigningOutAll, setIsSigningOutAll] = useState(false);

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  const handleSignOutAll = () => {
    setIsSigningOutAll(true);
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.isCurrent));
      setIsSigningOutAll(false);
    }, 1500);
  };

  const handleSignOut = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const SessionItem = ({ session }: { session: Session }) => (
    <View style={[styles.sessionCard, { backgroundColor: theme.colors.surfaceElevated }]}>
      <View style={[styles.deviceIcon, { backgroundColor: theme.colors.background }]}>
        <Ionicons 
          name={session.platform.includes("iOS") || session.platform.includes("Android") ? "phone-portrait" : "laptop"} 
          size={24} 
          color={session.isCurrent ? "#3CD09A" : theme.colors.textPrimary} 
        />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={[styles.deviceText, { color: theme.colors.textPrimary }]}>{session.device}</Text>
        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
          {session.platform} • {session.location}
        </Text>
        <Text style={[styles.activeText, { color: session.isCurrent ? "#3CD09A" : theme.colors.textMuted }]}>
          {session.lastActive}
        </Text>
      </View>
      {!session.isCurrent && (
        <TouchableOpacity style={styles.signOutBtn} onPress={() => handleSignOut(session.id)}>
          <Ionicons name="log-out-outline" size={20} color="#FF5C5C" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Active Sessions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>This Device</Text>
        {currentSession && <SessionItem session={currentSession} />}

        {otherSessions.length > 0 && (
          <>
            <View style={styles.otherHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginBottom: 0 }]}>Other Sessions</Text>
              <TouchableOpacity onPress={handleSignOutAll} disabled={isSigningOutAll}>
                {isSigningOutAll ? <ActivityIndicator size="small" color="#FF5C5C" /> : <Text style={styles.signOutAllText}>Sign Out All</Text>}
              </TouchableOpacity>
            </View>
            
            {otherSessions.map(s => (
              <SessionItem key={s.id} session={s} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 12, marginLeft: 16 },
  sessionCard: { flexDirection: "row", padding: 16, borderRadius: 20, marginBottom: 12, alignItems: "center" },
  deviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 16 },
  sessionInfo: { flex: 1 },
  deviceText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  metaText: { fontSize: 13, marginBottom: 4 },
  activeText: { fontSize: 12, fontWeight: "500" },
  signOutBtn: { padding: 8 },
  otherHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12, paddingHorizontal: 16 },
  signOutAllText: { color: "#FF5C5C", fontSize: 14, fontWeight: "600" },
});
