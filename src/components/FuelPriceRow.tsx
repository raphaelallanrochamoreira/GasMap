import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FuelPrice } from '../types';
import { Colors, Spacing } from '../theme';
import { FUEL_LABELS, FUEL_SHORT, formatPrice, priceColor, timeAgo } from '../utils/fuel';

const FUEL_COLORS: Record<string, string> = {
  gasolina: '#F59E0B',
  gasolina_aditivada: '#F97316',
  etanol: '#10B981',
  diesel: '#6366F1',
  diesel_s10: '#8B5CF6',
  gnv: '#3B82F6',
};

interface Props {
  fuelPrice: FuelPrice;
  allPrices: FuelPrice[];
  compact?: boolean;
}

export function FuelPriceRow({ fuelPrice, allPrices, compact }: Props) {
  const color = FUEL_COLORS[fuelPrice.type] ?? Colors.primary;
  const avg = allPrices.reduce((s, p) => s + p.price, 0) / allPrices.length;
  const pColor = priceColor(fuelPrice.price, avg);

  if (compact) {
    return (
      <View style={compact_s.container}>
        <Text style={[compact_s.type, { color }]}>{FUEL_SHORT[fuelPrice.type]}</Text>
        <Text style={compact_s.price}>{formatPrice(fuelPrice.price)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{FUEL_LABELS[fuelPrice.type]}</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.price, { color: pColor }]}>
          {formatPrice(fuelPrice.price)}
        </Text>
        <Text style={styles.updated}>{timeAgo(fuelPrice.updatedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    gap: 10,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  label: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  price: { fontSize: 15, fontWeight: '700' },
  updated: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
});

const compact_s = StyleSheet.create({
  container: { alignItems: 'center', gap: 3, minWidth: 70 },
  type: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  price: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
});
