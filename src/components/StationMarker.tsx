import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Station } from '../types';
import { Colors, Radius } from '../theme';
import { BRAND_COLORS, FUEL_SHORT } from '../utils/fuel';

interface Props {
  station: Station;
  selected: boolean;
}

export function StationMarker({ station, selected }: Props) {
  const color = BRAND_COLORS[station.brand] ?? Colors.primary;
  const topPrice = station.prices[0];

  return (
    <View style={[styles.wrapper, selected && styles.wrapperSelected]}>
      <View
        style={[
          styles.bubble,
          { borderColor: selected ? color : 'rgba(255,255,255,0.15)' },
          selected && { backgroundColor: '#111827' },
          !station.isOpen && styles.bubbleClosed,
        ]}
      >
        <Text style={[styles.brand, { color }]}>
          {station.brand.slice(0, 3).toUpperCase()}
        </Text>
        {topPrice && (
          <Text style={styles.price}>
            {FUEL_SHORT[topPrice.type]} R${topPrice.price.toFixed(2)}
          </Text>
        )}
      </View>
      <View style={[styles.pin, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  wrapperSelected: { transform: [{ scale: 1.12 }] },
  bubble: {
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minWidth: 82,
    alignItems: 'center',
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleClosed: { opacity: 0.55 },
  brand: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  price: { color: '#F8FAFC', fontSize: 11, fontWeight: '700', marginTop: 1 },
  pin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
});
