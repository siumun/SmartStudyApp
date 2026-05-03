import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import db from "../database/db";
import config from "../server/config";

const GOOGLE_API_KEY = 'AIzaSyAzEvJXnmJ1Hz6F7qV_Vn0i7EDddOuMvtg';

type LocationType = {
  latitude: number;
  longitude: number;
};

type LocationHistory = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

type PlaceType = {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
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
    console.warn("Permission error:", err);
    return false;
  }
};

const locationService = {
  getCurrentLocation: async (): Promise<LocationType> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (pos) => {
          console.log("GPS location:", pos.coords);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.log("GPS error:", err);
          resolve({
            latitude: 3.0445,
            longitude: 101.7955,
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  },
};

const cloudAPI = {
  sendLocationToCloud: async (coords: LocationType): Promise<boolean> => {
    try {
      const url = config.settings.serverPath + '/api/save-location';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (error) {
      console.log('Cloud save error:', error);
      return false;
    }
  },

  getHistoryFromCloud: async (): Promise<any[]> => {
    try {
      const url = config.settings.serverPath + '/api/location-history';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.log('Cloud fetch error:', error);
      return [];
    }
  },
};

const placeAPI = {
  searchNearbyPlaces: async (lat: number, lng: number, type: string): Promise<PlaceType[]> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${type}&key=${GOOGLE_API_KEY}`;
      console.log("Searching places:", url);
      const response = await fetch(url);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.log('Places search error:', error);
      return [];
    }
  },
};

const MapScreen = ({ navigation, route }: any) => {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [historyLocations, setHistoryLocations] = useState<LocationHistory[]>([]);
  const [cloudHistory, setCloudHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [showCloudHistory, setShowCloudHistory] = useState(false);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [placeFilter, setPlaceFilter] = useState<'cafe' | 'library'>('cafe');
  const [selectedPlace, setSelectedPlace] = useState<PlaceType | null>(null);

  const saveLocationToDB = async (coords: LocationType): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            "INSERT INTO locations (name, lat, lng) VALUES (?, ?, ?)",
            [`${new Date().toLocaleTimeString()}`, coords.latitude, coords.longitude],
            (_: any, result: any) => {
              resolve(result.insertId);
            },
            (err: any) => {
              reject(err);
              return true;
            }
          );
        },
        (err: any) => reject(err)
      );
    });
  };

  const getLocationHistoryFromDB = async (): Promise<LocationHistory[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          "SELECT * FROM locations ORDER BY id DESC LIMIT 20",
          [],
          (_: any, results: any) => {
            const rows: LocationHistory[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          },
          (err: any) => {
            reject(err);
            return true;
          }
        );
      });
    });
  };

  const loadLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError("Location permission denied");
        setLoading(false);
        return;
      }

      const coords = await locationService.getCurrentLocation();
      setCurrentLocation(coords);

      setSaving(true);
      await saveLocationToDB(coords);
      setSaving(false);

      setCloudSaving(true);
      await cloudAPI.sendLocationToCloud(coords);
      setCloudSaving(false);

      const localHistory = await getLocationHistoryFromDB();
      setHistoryLocations(localHistory);

      const cloudHistoryData = await cloudAPI.getHistoryFromCloud();
      setCloudHistory(cloudHistoryData);

      const nearbyPlaces = await placeAPI.searchNearbyPlaces(coords.latitude, coords.longitude, placeFilter);
      setPlaces(nearbyPlaces);

    } catch (err) {
      console.error("Error:", err);
      setError("Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await loadLocation();
  };

  const clearLocalHistory = () => {
    Alert.alert(
      "Clear History",
      "Delete all saved locations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            db.transaction(
              (tx: any) => {
                tx.executeSql(
                  "DELETE FROM locations",
                  [],
                  () => {
                    setHistoryLocations([]);
                    setShowHistory(false);
                    Alert.alert("Success", "History cleared");
                  },
                  (err: any) => {
                    console.log("Delete error:", err);
                    return true;
                  }
                );
              }
            );
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      placeAPI.searchNearbyPlaces(currentLocation.latitude, currentLocation.longitude, placeFilter)
        .then(setPlaces);
    }
  }, [placeFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B6FE8" />
        <Text style={styles.loadingText}>Getting location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, placeFilter === 'cafe' && styles.filterBtnActive]}
          onPress={() => setPlaceFilter('cafe')}
        >
          <Text style={[styles.filterText, placeFilter === 'cafe' && styles.filterTextActive]}>
            ☕ Cafes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, placeFilter === 'library' && styles.filterBtnActive]}
          onPress={() => setPlaceFilter('library')}
        >
          <Text style={[styles.filterText, placeFilter === 'library' && styles.filterTextActive]}>
            📚 Libraries
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={currentLocation}
              title="Current Location"
              pinColor="#3B6FE8"
            />

            {showHistory &&
              historyLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                  title={`History #${loc.id}`}
                  description={loc.name}
                  pinColor="#888888"
                />
              ))}

            {showCloudHistory &&
              cloudHistory.map((loc, index) => (
                <Marker
                  key={`cloud-${index}`}
                  coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                  title="Cloud"
                  pinColor="#FF6B35"
                />
              ))}

            {places.map((place) => (
              <Marker
                key={place.place_id}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                description={place.vicinity}
                pinColor={placeFilter === 'cafe' ? '#FF9500' : '#5CB85C'}
                onPress={() => setSelectedPlace(place)}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text>Loading map...</Text>
          </View>
        )}
      </View>

      {selectedPlace && (
        <View style={styles.placeCard}>
          <Text style={styles.placeName}>{selectedPlace.name}</Text>
          <Text style={styles.placeAddress}>{selectedPlace.vicinity}</Text>
          <TouchableOpacity onPress={() => setSelectedPlace(null)}>
            <Text style={styles.dismissText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.refreshButton]} onPress={refreshLocation}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.historyButton]} onPress={() => setShowHistory(!showHistory)}>
            <Text style={styles.buttonText}>{showHistory ? "Hide Local" : "Show Local"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.cloudButton]} onPress={() => setShowCloudHistory(!showCloudHistory)}>
            <Text style={styles.buttonText}>{showCloudHistory ? "Hide Cloud" : "Show Cloud"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLocalHistory}>
            <Text style={styles.clearButtonText}>Clear Local</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Current Location</Text>
          <Text style={styles.infoText}>
            Lat: {currentLocation?.latitude.toFixed(6)}
          </Text>
          <Text style={styles.infoText}>
            Lng: {currentLocation?.longitude.toFixed(6)}
          </Text>
          {saving && <Text style={styles.savingText}>Saving to SQLite...</Text>}
          {cloudSaving && <Text style={styles.cloudText}>Saving to Cloud...</Text>}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Nearby Places: {places.length}</Text>
          <Text style={styles.statsText}>Local Records: {historyLocations.length}</Text>
          <Text style={styles.statsText}>Cloud Records: {cloudHistory.length}</Text>
        </View>
      </View>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FB" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#64748B" },
  errorText: { color: "#EF4444", fontSize: 14, marginBottom: 16 },
  retryButton: { backgroundColor: "#3B6FE8", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#FFFFFF", fontWeight: "600" },

  filterRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#3B6FE8' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },

  mapContainer: { flex: 2 },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, backgroundColor: "#E8ECEF", justifyContent: "center", alignItems: "center" },

  placeCard: {
    position: 'absolute',
    bottom: 300,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  placeAddress: { fontSize: 13, color: '#666', marginTop: 4 },
  dismissText: { fontSize: 13, color: '#3B6FE8', marginTop: 8 },

  panel: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  infoCard: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 12, marginBottom: 12 },
  infoTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  infoText: { fontSize: 13, color: "#475569", marginBottom: 4 },
  savingText: { fontSize: 11, color: "#10B981", marginTop: 6 },
  cloudText: { fontSize: 11, color: "#3B6FE8", marginTop: 4 },
  buttonRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  refreshButton: { backgroundColor: "#3B6FE8" },
  historyButton: { backgroundColor: "#64748B" },
  cloudButton: { backgroundColor: "#FF6B35" },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  clearButton: { backgroundColor: "#FEE2E2", flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  clearButtonText: { color: "#EF4444", fontWeight: "600", fontSize: 14 },
  statsCard: { backgroundColor: "#E8ECF2", borderRadius: 10, padding: 10, alignItems: "center", gap: 4 },
  statsText: { fontSize: 12, color: "#475569", fontWeight: "500" },
});
