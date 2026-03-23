import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { selectStation, setFuelFilter, setSortBy } from '../store/slices/appSlice';
import { haversineDistanceKm, formatDistance } from '../utils/geo';
import { BRAND_COLORS, FUEL_LABELS, FUEL_SHORT, ALL_FUELS, formatPrice, timeAgo } from '../utils/fuel';
import { Station, FuelType, MapStackParamList } from '../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Fake map dots (decorative background) ───────────────────────────────────

const GRID_DOTS = Array.from({ length: 180 }, (_, i) => ({
  key: String(i),
  x: (i % 15) / 14,
  y: Math.floor(i / 15) / 11,
}));

// ─── Mini map card (visual representation of a station on the "map") ─────────

function StationDot({
  station,
  selected,
  onPress,
  mapW,
  mapH,
  minLat,
  maxLat,
  minLng,
  maxLng,
}: {
  station: Station;
  selected: boolean;
  onPress: () => void;
  mapW: number;
  mapH: number;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const color = BRAND_COLORS[station.brand] ?? Colors.primary;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.18 : 1,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  }, [selected]);

  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;
  const pad = 32;
  const x = pad + ((station.coordinates.longitude - minLng) / lngRange) * (mapW - pad * 2);
  const y = pad + ((maxLat - station.coordinates.latitude) / latRange) * (mapH - pad * 2 - 40);

  const topPrice = station.prices[0];

  return (
    <Animated.View
      style={[
        styles.stationDot,
        { left: x - 44, top: y - 48, transform: [{ scale }], zIndex: selected ? 10 : 2 },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View
          style={[
            styles.dotBubble,
            {
              borderColor: selected ? color : 'rgba(255,255,255,0.15)',
              backgroundColor: selected ? '#111827' : 'rgba(15,23,42,0.95)',
              shadowColor: color,
              shadowOpacity: selected ? 0.5 : 0,
              shadowRadius: 8,
              elevation: selected ? 8 : 3,
            },
          ]}
        >
          <Text style={[styles.dotBrand, { color }]}>
            {station.brand.slice(0, 3).toUpperCase()}
          </Text>
          {topPrice && (
            <Text style={styles.dotPrice}>
              {FUEL_SHORT[topPrice.type]} R${topPrice.price.toFixed(2)}
            </Text>
          )}
        </View>
        <View style={[styles.dotPin, { backgroundColor: color }]} />
        {!station.isOpen && <View style={StyleSheet.absoluteFillObject} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Station list card ────────────────────────────────────────────────────────

function StationCard({
  station,
  selected,
  onPress,
  onDetail,
  fuelFilter,
}: {
  station: Station;
  selected: boolean;
  onPress: () => void;
  onDetail: () => void;
  fuelFilter: FuelType | null;
}) {
  const color = BRAND_COLORS[station.brand] ?? Colors.primary;
  const highlightedPrice = fuelFilter
    ? station.prices.find(p => p.type === fuelFilter)
    : station.prices[0];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && { borderColor: color, borderWidth: 1.5 },
        pressed && { opacity: 0.92 },
      ]}
    >
      {/* Brand stripe */}
      <View style={[styles.cardStripe, { backgroundColor: color }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>
              {station.name}
            </Text>
            <Text style={styles.cardAddress} numberOfLines={1}>
              {station.address}
            </Text>
          </View>
          <View style={styles.cardTopRight}>
            <View
              style={[
                styles.openBadge,
                { backgroundColor: station.isOpen ? '#052e16' : '#2d0a0a' },
              ]}
            >
              <View
                style={[
                  styles.openDot,
                  { backgroundColor: station.isOpen ? Colors.success : Colors.error },
                ]}
              />
              <Text
                style={[
                  styles.openText,
                  { color: station.isOpen ? Colors.success : Colors.error },
                ]}
              >
                {station.isOpen ? 'Aberto' : 'Fechado'}
              </Text>
            </View>
            {station.distanceKm != null && (
              <Text style={styles.distance}>
                {formatDistance(station.distanceKm)}
              </Text>
            )}
          </View>
        </View>

        {/* Prices row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pricesRow}
        >
          {station.prices.map(fp => (
            <View
              key={fp.type}
              style={[
                styles.priceChip,
                fuelFilter === fp.type && { borderColor: color, borderWidth: 1.5 },
              ]}
            >
              <Text
                style={[
                  styles.priceChipType,
                  {
                    color:
                      fuelFilter === fp.type
                        ? color
                        : Colors.textMuted,
                  },
                ]}
              >
                {FUEL_SHORT[fp.type]}
              </Text>
              <Text style={styles.priceChipValue}>R${fp.price.toFixed(2)}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons
                key={i}
                name={i <= Math.round(station.rating) ? 'star' : 'star-outline'}
                size={11}
                color="#FBBF24"
              />
            ))}
            <Text style={styles.ratingText}>{station.rating.toFixed(1)}</Text>
          </View>
          <TouchableOpacity style={styles.detailBtn} onPress={onDetail}>
            <Text style={[styles.detailBtnText, { color }]}>Ver detalhes</Text>
            <Ionicons name="chevron-forward" size={13} color={color} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar() {
  const dispatch = useAppDispatch();
  const { fuelType, sortBy } = useAppSelector(s => s.app.filters);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {ALL_FUELS.map(f => (
        <TouchableOpacity
          key={f}
          style={[styles.filterChip, fuelType === f && styles.filterChipActive]}
          onPress={() => dispatch(setFuelFilter(fuelType === f ? null : f))}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.filterChipText,
              fuelType === f && styles.filterChipTextActive,
            ]}
          >
            {FUEL_SHORT[f]}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={styles.filterDivider} />
      {(['distance', 'price', 'rating'] as const).map(s => (
        <TouchableOpacity
          key={s}
          style={[styles.filterChip, sortBy === s && styles.filterChipSort]}
          onPress={() => dispatch(setSortBy(s))}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.filterChipText,
              sortBy === s && styles.filterChipTextActive,
            ]}
          >
            {s === 'distance' ? 'Distância' : s === 'price' ? 'Preço' : 'Avaliação'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type Mode = 'map' | 'list';

export function MapScreen() {
  const navigation = useNavigation<StackNavigationProp<MapStackParamList>>();
  const dispatch = useAppDispatch();
  const { stations, selectedStationId, filters } = useAppSelector(s => s.app);

  const [mode, setMode] = useState<Mode>('map');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      try {
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
      } catch (_) {}
      setLocationLoading(false);
    })();
  }, []);

  // Filter + sort
  const filtered = stations
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
      if (filters.sortBy === 'distance') return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      const fuel = filters.fuelType ?? 'gasolina';
      const pa = a.prices.find(p => p.type === fuel)?.price ?? 99;
      const pb = b.prices.find(p => p.type === fuel)?.price ?? 99;
      return pa - pb;
    });

  const selectedStation = filtered.find(s => s.id === selectedStationId) ?? null;

  // Bounding box for the fake map
  const lats = filtered.map(s => s.coordinates.latitude);
  const lngs = filtered.map(s => s.coordinates.longitude);
  const minLat = Math.min(...lats) - 0.003;
  const maxLat = Math.max(...lats) + 0.003;
  const minLng = Math.min(...lngs) - 0.003;
  const maxLng = Math.max(...lngs) + 0.003;

  const MAP_H = SCREEN_H * 0.52;
  const MAP_W = SCREEN_W;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="flash" size={22} color={Colors.primary} />
            <Text style={styles.headerTitle}>GasMap</Text>
          </View>
          <View style={styles.headerRight}>
            {locationLoading && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
            <TouchableOpacity
              style={styles.modeBtnWrap}
              onPress={() => {
                setMode(m => (m === 'map' ? 'list' : 'map'));
                dispatch(selectStation(null));
              }}
            >
              <Ionicons
                name={mode === 'map' ? 'list-outline' : 'map-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter bar */}
        <FilterBar />
      </SafeAreaView>

      {/* ── MAP MODE ── */}
      {mode === 'map' && (
        <View style={{ flex: 1 }}>
          {/* Fake map background */}
          <View style={[styles.fakeMap, { height: MAP_H }]}>
            {/* Grid dots */}
            {GRID_DOTS.map(d => (
              <View
                key={d.key}
                style={[
                  styles.gridDot,
                  {
                    left: d.x * (MAP_W - 8),
                    top: d.y * (MAP_H - 8),
                  },
                ]}
              />
            ))}

            {/* Road lines (decorative) */}
            <View style={styles.roadH1} />
            <View style={styles.roadH2} />
            <View style={styles.roadV1} />
            <View style={styles.roadV2} />
            <View style={styles.roadDiag} />

            {/* Block fills */}
            <View style={styles.block1} />
            <View style={styles.block2} />
            <View style={styles.block3} />

            {/* User dot */}
            {userLocation && (
              <View
                style={[
                  styles.userDot,
                  {
                    left: MAP_W / 2 - 10,
                    top: MAP_H / 2 - 10,
                  },
                ]}
              >
                <View style={styles.userDotPulse} />
                <View style={styles.userDotCore} />
              </View>
            )}

            {/* Station dots */}
            {filtered.map(s => (
              <StationDot
                key={s.id}
                station={s}
                selected={selectedStation?.id === s.id}
                onPress={() =>
                  dispatch(
                    selectStation(
                      selectedStation?.id === s.id ? null : s.id,
                    ),
                  )
                }
                mapW={MAP_W}
                mapH={MAP_H}
                minLat={minLat}
                maxLat={maxLat}
                minLng={minLng}
                maxLng={maxLng}
              />
            ))}

            {/* Map label */}
            <View style={styles.mapLabel}>
              <Ionicons name="map-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.mapLabelText}>
                {filtered.length} postos na região
              </Text>
            </View>
          </View>

          {/* Selected station detail OR station list strip */}
          {selectedStation ? (
            <View style={styles.selectedPanel}>
              <View style={styles.selectedHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedName} numberOfLines={1}>
                    {selectedStation.name}
                  </Text>
                  <View style={styles.selectedMeta}>
                    <View
                      style={[
                        styles.openBadge,
                        {
                          backgroundColor: selectedStation.isOpen
                            ? '#052e16'
                            : '#2d0a0a',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.openDot,
                          {
                            backgroundColor: selectedStation.isOpen
                              ? Colors.success
                              : Colors.error,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.openText,
                          {
                            color: selectedStation.isOpen
                              ? Colors.success
                              : Colors.error,
                          },
                        ]}
                      >
                        {selectedStation.isOpen ? 'Aberto' : 'Fechado'}
                      </Text>
                    </View>
                    {selectedStation.distanceKm != null && (
                      <Text style={styles.distance}>
                        {formatDistance(selectedStation.distanceKm)}
                      </Text>
                    )}
                    <Text style={styles.distance}>
                      {selectedStation.openHours}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => dispatch(selectStation(null))}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedPrices}
              >
                {selectedStation.prices.map(fp => (
                  <View key={fp.type} style={styles.selectedPriceCard}>
                    <Text
                      style={[
                        styles.selectedPriceType,
                        {
                          color:
                            filters.fuelType === fp.type
                              ? BRAND_COLORS[selectedStation.brand]
                              : Colors.textMuted,
                        },
                      ]}
                    >
                      {FUEL_LABELS[fp.type]}
                    </Text>
                    <Text style={styles.selectedPriceValue}>
                      R${fp.price.toFixed(3).replace('.', ',')}
                    </Text>
                    <Text style={styles.selectedPriceUpdated}>
                      {timeAgo(fp.updatedAt)}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.detailFullBtn,
                  {
                    backgroundColor:
                      BRAND_COLORS[selectedStation.brand] ?? Colors.primary,
                  },
                ]}
                onPress={() =>
                  navigation.navigate('StationDetail', {
                    stationId: selectedStation.id,
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="navigate-outline" size={16} color="#fff" />
                <Text style={styles.detailFullBtnText}>Ver detalhes completos</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filtered.slice(0, 3)}
              keyExtractor={i => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stripList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stripCard}
                  onPress={() => dispatch(selectStation(item.id))}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.stripStripe,
                      {
                        backgroundColor:
                          BRAND_COLORS[item.brand] ?? Colors.primary,
                      },
                    ]}
                  />
                  <View style={styles.stripBody}>
                    <Text style={styles.stripName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.stripPrice}>
                      {item.prices[0]
                        ? `${FUEL_SHORT[item.prices[0].type]} R$${item.prices[0].price.toFixed(2)}`
                        : '—'}
                    </Text>
                    {item.distanceKm != null && (
                      <Text style={styles.stripDist}>
                        {formatDistance(item.distanceKm)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* ── LIST MODE ── */}
      {mode === 'list' && (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {filtered.length} posto{filtered.length !== 1 ? 's' : ''} encontrado
              {filtered.length !== 1 ? 's' : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={40}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>
                Nenhum posto encontrado com os filtros atuais.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <StationCard
              station={item}
              selected={selectedStationId === item.id}
              onPress={() =>
                dispatch(
                  selectStation(
                    selectedStationId === item.id ? null : item.id,
                  ),
                )
              }
              onDetail={() =>
                navigation.navigate('StationDetail', { stationId: item.id })
              }
              fuelFilter={filters.fuelType}
            />
          )}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeTop: { backgroundColor: Colors.background, zIndex: 10 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeBtnWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipSort: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.borderLight },
  filterChipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: Colors.white },
  filterDivider: { width: 1, height: 18, backgroundColor: Colors.border, marginHorizontal: 4 },

  // Fake map
  fakeMap: {
    width: '100%',
    backgroundColor: '#111827',
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gridDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(51,65,85,0.6)',
  },
  // Roads
  roadH1: { position: 'absolute', left: 0, right: 0, top: '35%', height: 6, backgroundColor: '#1e293b' },
  roadH2: { position: 'absolute', left: 0, right: 0, top: '68%', height: 4, backgroundColor: '#1a2333' },
  roadV1: { position: 'absolute', top: 0, bottom: 0, left: '42%', width: 6, backgroundColor: '#1e293b' },
  roadV2: { position: 'absolute', top: 0, bottom: 0, left: '75%', width: 4, backgroundColor: '#1a2333' },
  roadDiag: {
    position: 'absolute',
    left: '-10%',
    top: '20%',
    width: '60%',
    height: 4,
    backgroundColor: '#1a2333',
    transform: [{ rotate: '18deg' }],
  },
  // Blocks
  block1: {
    position: 'absolute',
    left: '44%',
    top: '37%',
    width: '29%',
    height: '29%',
    backgroundColor: '#0f172a',
    borderRadius: 4,
  },
  block2: {
    position: 'absolute',
    left: '5%',
    top: '37%',
    width: '35%',
    height: '27%',
    backgroundColor: '#0f172a',
    borderRadius: 4,
  },
  block3: {
    position: 'absolute',
    left: '77%',
    top: '10%',
    width: '18%',
    height: '22%',
    backgroundColor: '#0f172a',
    borderRadius: 4,
  },

  // User dot
  userDot: { position: 'absolute', width: 20, height: 20 },
  userDotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59,130,246,0.25)',
    top: -4,
    left: -4,
  },
  userDotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 2.5,
    borderColor: '#fff',
    margin: 3,
  },

  // Station dots
  stationDot: { position: 'absolute' },
  dotBubble: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minWidth: 82,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
  },
  dotBrand: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  dotPrice: { color: Colors.textPrimary, fontSize: 10, fontWeight: '700', marginTop: 1 },
  dotPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 3,
    borderWidth: 1.5,
    borderColor: '#111827',
  },

  // Map label
  mapLabel: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  mapLabelText: { color: Colors.textMuted, fontSize: 10 },

  // Selected panel
  selectedPanel: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  selectedHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  selectedName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  selectedMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' },
  selectedPrices: { gap: Spacing.sm },
  selectedPriceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 10,
    minWidth: 90,
    alignItems: 'center',
    gap: 2,
  },
  selectedPriceType: { fontSize: 11, fontWeight: '600' },
  selectedPriceValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
  selectedPriceUpdated: { color: Colors.textMuted, fontSize: 10 },
  detailFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.md,
    paddingVertical: 13,
  },
  detailFullBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Strip (bottom of map mode when no selection)
  stripList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  stripCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    width: 180,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stripStripe: { width: 4 },
  stripBody: { flex: 1, padding: Spacing.md, gap: 3 },
  stripName: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  stripPrice: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  stripDist: { color: Colors.textMuted, fontSize: 11 },

  // List mode
  listContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  listHeader: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 4 },

  // Station card (list mode)
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardStripe: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.md, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  cardAddress: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  cardTopRight: { alignItems: 'flex-end', gap: 4 },
  pricesRow: { gap: 6 },
  priceChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priceChipType: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  priceChipValue: { color: Colors.textPrimary, fontSize: 12, fontWeight: '800' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: Colors.textMuted, fontSize: 11, marginLeft: 4 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailBtnText: { fontSize: 12, fontWeight: '600' },

  // Badges
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 10, fontWeight: '700' },
  distance: { color: Colors.textMuted, fontSize: 11 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
});
