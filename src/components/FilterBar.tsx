import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';
import { FuelType } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { setFuelFilter, setSortBy } from '../store/slices/appSlice';
import { FUEL_SHORT } from '../utils/fuel';

const FUELS: FuelType[] = [
  'gasolina',
  'gasolina_aditivada',
  'etanol',
  'diesel',
  'diesel_s10',
  'gnv',
];

export function FilterBar() {
  const dispatch = useAppDispatch();
  const { fuelType, sortBy } = useAppSelector(s => s.app.filters);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FUELS.map(f => (
        <TouchableOpacity
          key={f}
          style={[styles.chip, fuelType === f && styles.chipActive]}
          onPress={() => dispatch(setFuelFilter(fuelType === f ? null : f))}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, fuelType === f && styles.chipTextActive]}>
            {FUEL_SHORT[f]}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      {(['distance', 'price', 'rating'] as const).map(s => (
        <TouchableOpacity
          key={s}
          style={[styles.chip, sortBy === s && styles.chipActiveSort]}
          onPress={() => dispatch(setSortBy(s))}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, sortBy === s && styles.chipTextActive]}>
            {s === 'distance' ? 'Distância' : s === 'price' ? 'Preço' : 'Avaliação'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(30,41,59,0.92)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipActiveSort: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderLight,
  },
  chipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
});
