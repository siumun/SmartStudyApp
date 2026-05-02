import React, { useEffect, useState } from "react";
import {
  View, Text, PermissionsAndroid, Platform,
  TouchableOpacity, Linking, StyleSheet,
  StatusBar, ActivityIndicator,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import PrimaryButton from "../components/PrimaryButton";
import Header from "../components/Header";
import db from "../database/db";

type LocationType = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
};

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    Geolocation.requestAuthorization();
    return true;
  }
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const CoordRow = ({
  label, value, accent,
}: {
  label: string;
  value: string | number | null | undefined;
  accent?: boolean;
}) => (
  <View style={styles.coordRow}>
    <View style={styles.coordLabelRow}>
      <View style={[styles.coordDot, accent && styles.coordDotAccent]} />
      <Text style={styles.coordLabel}>{label}</Text>
    </View>
    <Text style={[styles.coordValue, accent && styles.coordValueAccent]}>
      {value !== null && value !== undefined ? String(value) : "—"}
    </Text>
  </View>
);

const App = ({ navigation, route }: any) => {
  const [position, setPosition] = useState<LocationType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let watchId: number | null = null;

    const start = async () => {
      const ok = await requestLocationPermission();
      if (!ok) {
        setError("Location permission denied.");
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
          });
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      watchId = Geolocation.watchPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
          });
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    };

    start();

    return () => {
      if (watchId !== null) Geolocation.clearWatch(watchId);
    };
  }, []);

  const openMap = () => {
    if (!position) return;
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${position.latitude},${position.longitude}`
        : `geo:${position.latitude},${position.longitude}?q=${position.latitude},${position.longitude}`;
    Linking.openURL(url);
  };

  const saveLocationAndNext = () => {
    if (!position) {
      navigation.navigate('Timer', { taskId: route.params.taskId });
      return;
    }

    db.transaction(
      (tx: any) => {
        tx.executeSql(
          'INSERT INTO locations (name, lat, lng) VALUES (?, ?, ?)',
          [
            `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
            position.latitude,
            position.longitude,
          ],
          (_, result: any) => {
            const locationId = result.insertId;
            console.log('Location saved, id:', locationId);

            tx.executeSql(
              'INSERT OR REPLACE INTO sessions (task_id, location_id, duration) VALUES (?, ?, 0)',
              [route.params.taskId, locationId],
              (_: any, res: any) => console.log('Session created with location:', res),
              (_: any, err: any) => { console.log('SESSION ERROR:', err); return true; }
            );
          },
          (_: any, err: any) => { console.log('LOCATION INSERT ERROR:', err); return true; }
        );
      },
      (err: any) => console.log('TRANSACTION ERROR:', err),
      () => navigation.navigate('Timer', { taskId: route.params.taskId })
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FB" }}>
      <Header navigation={navigation} showEdit={false} />

      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

        <View style={styles.top}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.headerEyebrow}>LIVE TRACKING</Text>
          </View>
          <Text style={styles.headerTitle}>My Location</Text>
          <Text style={styles.headerSub}>GPS coordinates updated in real‑time</Text>
        </View>

        <View style={styles.iconWrapper}>
          <View style={styles.ringOuter} />
          <View style={styles.ringMid} />
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📍</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Coordinates</Text>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: error ? "#EF4444" : "#22C55E" }]} />
              <Text style={styles.liveText}>
                {error ? "Error" : loading ? "Searching" : "Live"}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {loading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator color="#3B6FE8" size="large" />
              <Text style={styles.loadingText}>Acquiring signal…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorWrapper}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <CoordRow label="LATITUDE" value={position?.latitude?.toFixed(6)} accent />
              <View style={styles.rowDivider} />
              <CoordRow label="LONGITUDE" value={position?.longitude?.toFixed(6)} accent />
              <View style={styles.rowDivider} />
              <CoordRow
                label="ALTITUDE"
                value={position?.altitude != null ? `${position.altitude.toFixed(1)} m` : "N/A"}
              />
              <PrimaryButton title="Open in Maps →" onPress={openMap} />
            </>
          )}
        </View>

        <View style={styles.buttonWrapper}>
          <PrimaryButton title="Next" onPress={saveLocationAndNext} />
        </View>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },

  top: {
    alignItems: "center",
    marginBottom: 36,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B6FE8",
  },
  headerEyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    color: "#3B6FE8",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13,
    color: "#94A3B8",
    letterSpacing: 0.1,
  },

  // Icon rings
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    width: 110,
    height: 110,
  },
  ringOuter: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "rgba(59,111,232,0.12)",
    backgroundColor: "rgba(59,111,232,0.04)",
  },
  ringMid: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: "rgba(59,111,232,0.2)",
    backgroundColor: "rgba(59,111,232,0.07)",
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B6FE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  iconEmoji: {
    fontSize: 24,
  },

  // Card
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8ECF2",
    paddingHorizontal: 20,
    paddingBottom: 8,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  cardHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 0.2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 4,
  },

  // Coord rows
  coordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  coordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coordDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  coordDotAccent: {
    backgroundColor: "#3B6FE8",
  },
  coordLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#94A3B8",
    fontWeight: "700",
  },
  coordValue: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  coordValueAccent: {
    color: "#0F172A",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F8F9FB",
  },

  // Loading / error
  loadingWrapper: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  errorWrapper: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  errorIcon: {
    fontSize: 28,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  // Button
  buttonWrapper: {
    width: "100%",
    marginTop: "auto",
  },

});