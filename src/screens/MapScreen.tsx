import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, PermissionsAndroid, Platform,
  StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from "react-native-maps";

const GOOGLE_API_KEY = 'YOUR_API_KEY_HERE';

type LocationType = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
};

type PlaceType = {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  types: string[];
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

const MapScreen = () => {
  const [position, setPosition] = useState<LocationType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [filter, setFilter] = useState<'cafe' | 'library'>('cafe');
  const [selectedPlace, setSelectedPlace] = useState<PlaceType | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const fetchNearbyPlaces = async (lat: number, lng: number, type: 'cafe' | 'library') => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${type}&key=AIzaSyAzEvJXnmJ1Hz6F7qV_Vn0i7EDddOuMvtg`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) {
        setPlaces(data.results);
      }
    } catch (err) {
      console.log('Places fetch error:', err);
    }
  };

  useEffect(() => {
    const start = async () => {
      const ok = await requestLocationPermission();
      if (!ok) {
        setError("Location permission denied.");
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
          };
          setPosition(location);
          setLoading(false);
          fetchNearbyPlaces(location.latitude, location.longitude, filter);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      watchIdRef.current = Geolocation.watchPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
          });
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    };

    start();

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (position) {
      setPlaces([]);
      setSelectedPlace(null);
      fetchNearbyPlaces(position.latitude, position.longitude, filter);
    }
  }, [filter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'cafe' && styles.filterBtnActive]}
          onPress={() => setFilter('cafe')}
        >
          <Text style={[styles.filterText, filter === 'cafe' && styles.filterTextActive]}>
            ☕ Cafes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'library' && styles.filterBtnActive]}
          onPress={() => setFilter('library')}
        >
          <Text style={[styles.filterText, filter === 'library' && styles.filterTextActive]}>
            📚 Libraries
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      {position ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* User location marker */}
          <Marker
            coordinate={{ latitude: position.latitude, longitude: position.longitude }}
            title="You are here"
            pinColor="#4A90E2"
          />

          {/* Nearby places markers */}
          {places.map((place) => (
            <Marker
              key={place.place_id}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity}
              pinColor={filter === 'cafe' ? '#FF6B35' : '#5CB85C'}
              onPress={() => setSelectedPlace(place)}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>
            {error ? "Unable to load map" : "Getting location..."}
          </Text>
        </View>
      )}

      {/* Selected place card */}
      {selectedPlace && (
        <View style={styles.placeCard}>
          <Text style={styles.placeName}>{selectedPlace.name}</Text>
          <Text style={styles.placeAddress}>{selectedPlace.vicinity}</Text>
          <TouchableOpacity onPress={() => setSelectedPlace(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Places list */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {filter === 'cafe' ? '☕ Nearby Cafes' : '📚 Nearby Libraries'} ({places.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {places.map((place) => (
            <TouchableOpacity
              key={place.place_id}
              style={styles.listCard}
              onPress={() => setSelectedPlace(place)}
            >
              <Text style={styles.listCardName} numberOfLines={1}>{place.name}</Text>
              <Text style={styles.listCardAddress} numberOfLines={2}>{place.vicinity}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },

  // Filter
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
  filterBtnActive: { backgroundColor: '#4A90E2' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },

  // Map
  map: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#666", fontSize: 14 },

  // Selected place card
  placeCard: {
    position: 'absolute',
    bottom: 160,
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
  dismissText: { fontSize: 13, color: '#4A90E2', marginTop: 8 },

  // List
  listContainer: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listTitle: { fontSize: 13, fontWeight: '700', color: '#333', paddingHorizontal: 16, marginBottom: 10 },
  listCard: {
    width: 140,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    padding: 12,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listCardName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  listCardAddress: { fontSize: 11, color: '#888', marginTop: 4 },
});