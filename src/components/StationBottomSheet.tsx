import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Station } from '../types';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { FuelPriceRow } from './FuelPriceRow';
import { formatDistance } from '../utils/geo';
import { MapStackParamList } from '../types';

interface Props {
  station: Station;
  onClose: () => void;
}

export function StationBottomSheet({ station, onClose }: Props) {
  const navigation = useNavigation<StackNavigationProp<MapStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {station.name}
          </Text>
          <View style={styles.meta}>
            <View
              style={[
                styles.openBadge,
                { backgroundColor: station.isOpen ? '#052e16' : '#2d0a0a' },
              ]}
            >
              <Text
                style={{
                  color: station.isOpen ? Colors.success : Colors.error,
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {station.isOpen ? 'Aberto' : 'Fechado'}
              </Text>
            </View>
            <Text style={styles.hours}>{station.openHours}</Text>
            {station.distanceKm != null && (
              <Text style={styles.distance}>{formatDistance(station.distanceKm)}</Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() =>
              navigation.navigate('StationDetail', { stationId: station.id })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.detailBtnText}>Detalhes</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fuel prices horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pricesRow}
      >
        {station.prices.map(fp => (
          <View key={fp.type} style={styles.priceCard}>
            <FuelPriceRow
              fuelPrice={fp}
              allPrices={station.prices}
              compact
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  hours: { color: Colors.textMuted, fontSize: 11 },
  distance: { color: Colors.textMuted, fontSize: 11 },
  headerActions: { alignItems: 'flex-end', gap: 8 },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricesRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  priceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minWidth: 90,
    alignItems: 'center',
  },
});
