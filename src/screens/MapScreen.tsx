import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { selectStation } from '../store/slices/appSlice';
import { haversineDistanceKm } from '../utils/geo';
import { StationMarker } from '../components/StationMarker';
import { StationBottomSheet } from '../components/StationBottomSheet';
import { FilterBar } from '../components/FilterBar';
import { DEFAULT_REGION } from '../data/mockStations';

export function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const dispatch = useAppDispatch();
  const { stations, selectedStationId, filters } = useAppSelector(s => s.app);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Request location on mount
  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
      setLocationLoading(false);
    })();
  }, []);

  // Filtered + sorted stations
  const filteredStations = stations
    .filter(s => {
      if (filters.onlyOpen && !s.isOpen) return false;
      if (filters.onlyFavorites && !s.isFavorite) return false;
      if (filters.fuelType && !s.prices.find(p => p.type === filters.fuelType))
        return false;
      return true;
    })
    .map(s => ({
      ...s,
      distanceKm: userLocation
        ? haversineDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            s.coordinates.latitude,
            s.coordinates.longitude,
          )
        : s.distanceKm,
    }))
    .sort((a, b) => {
      if (filters.sortBy === 'distance')
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      const fuel = filters.fuelType ?? 'gasolina';
      const pa = a.prices.find(p => p.type === fuel)?.price ?? 999;
      const pb = b.prices.find(p => p.type === fuel)?.price ?? 999;
      return pa - pb;
    });

  const selectedStation =
    filteredStations.find(s => s.id === selectedStationId) ?? null;

  const centerOnUser = async () => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600,
      );
    } else {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
      setLocationLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
        onPress={() => dispatch(selectStation(null))}
      >
        {filteredStations.map(station => (
          <Marker
            key={station.id}
            coordinate={station.coordinates}
            onPress={() => dispatch(selectStation(station.id))}
            tracksViewChanges={false}
          >
            <StationMarker
              station={station}
              selected={selectedStation?.id === station.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* Top overlay */}
      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Buscar postos, rua, bairro…</Text>
        </View>
        <FilterBar />
      </SafeAreaView>

      {/* Station count badge */}
      {filteredStations.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {filteredStations.length} posto
            {filteredStations.length !== 1 ? 's' : ''} encontrado
            {filteredStations.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* FAB – my location */}
      <TouchableOpacity
        style={styles.fab}
        onPress={centerOnUser}
        activeOpacity={0.85}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="locate-outline" size={22} color={Colors.primary} />
        )}
      </TouchableOpacity>

      {/* Bottom sheet for selected station */}
      {selectedStation && (
        <StationBottomSheet
          station={selectedStation}
          onClose={() => dispatch(selectStation(null))}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30,41,59,0.96)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  searchPlaceholder: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  countBadge: {
    position: 'absolute',
    top: 148,
    alignSelf: 'center',
    backgroundColor: 'rgba(30,41,59,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countText: { color: Colors.textSecondary, fontSize: 12 },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a9bb0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1f2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d4f68' }],
  },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
