import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { MapStackParamList } from '../types';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useAppSelector, useAppDispatch } from '../store';
import { toggleFavorite } from '../store/slices/appSlice';
import { FuelPriceRow } from '../components/FuelPriceRow';
import { AmenityChip } from '../components/AmenityChip';
import { RatingStars } from '../components/RatingStars';
import { formatDistance } from '../utils/geo';
import { BRAND_COLORS } from '../utils/fuel';

type Props = StackScreenProps<MapStackParamList, 'StationDetail'>;

export function StationDetailScreen({ route, navigation }: Props) {
  const { stationId } = route.params;
  const dispatch = useAppDispatch();
  const station = useAppSelector(s =>
    s.app.stations.find(st => st.id === stationId),
  );

  if (!station) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: Colors.textPrimary, padding: 20 }}>
          Posto não encontrado.
        </Text>
      </SafeAreaView>
    );
  }

  const brandColor = BRAND_COLORS[station.brand] ?? Colors.primary;

  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.latitude},${station.coordinates.longitude}`;
    Linking.openURL(url);
  };

  const callStation = () => {
    if (station.phone) Linking.openURL(`tel:${station.phone}`);
  };

  const handleShare = () => {
    Alert.alert('Compartilhar', `${station.name}\n${station.address}, ${station.city}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: brandColor + '44' }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.stationName} numberOfLines={1}>
            {station.name}
          </Text>
          <Text style={[styles.stationBrand, { color: brandColor }]}>
            {station.brand}
          </Text>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(toggleFavorite(station.id))}
          style={styles.iconBtn}
        >
          <Ionicons
            name={station.isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={station.isFavorite ? Colors.error : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status row */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: station.isOpen ? '#052e16' : '#2d0a0a' },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: station.isOpen
                    ? Colors.success
                    : Colors.error,
                },
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                { color: station.isOpen ? Colors.success : Colors.error },
              ]}
            >
              {station.isOpen ? 'Aberto agora' : 'Fechado'}
            </Text>
          </View>

          <View style={styles.infoPill}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.pillText}>{station.openHours}</Text>
          </View>

          {station.distanceKm != null && (
            <View style={styles.infoPill}>
              <Ionicons
                name="navigate-outline"
                size={12}
                color={Colors.textMuted}
              />
              <Text style={styles.pillText}>
                {formatDistance(station.distanceKm)}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        <View style={styles.addressRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={Colors.textMuted}
          />
          <Text style={styles.addressText}>
            {station.address}, {station.city} – {station.state}
          </Text>
        </View>

        <RatingStars rating={station.rating} total={station.totalRatings} />

        {/* Fuel prices */}
        <Text style={styles.sectionTitle}>Preços dos combustíveis</Text>
        <View style={styles.card}>
          {station.prices.map((fp, i) => (
            <View key={fp.type}>
              <FuelPriceRow fuelPrice={fp} allPrices={station.prices} />
              {i < station.prices.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Amenities */}
        {station.amenities.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Comodidades</Text>
            <View style={styles.amenitiesRow}>
              {station.amenities.map(a => (
                <AmenityChip key={a} amenity={a} />
              ))}
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={openMaps}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={18} color={Colors.white} />
            <Text style={styles.actionText}>Como chegar</Text>
          </TouchableOpacity>

          {station.phone && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline]}
              onPress={callStation}
              activeOpacity={0.85}
            >
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={[styles.actionText, { color: Colors.primary }]}>
                Ligar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: 4,
  },
  iconBtn: { padding: 6 },
  headerTitle: { flex: 1, paddingHorizontal: 4 },
  stationName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  stationBrand: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { color: Colors.textMuted, fontSize: 11 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addressText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 19,
  },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionsRow: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  actionText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
