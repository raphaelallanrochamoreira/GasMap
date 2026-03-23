import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Amenity } from '../types';
import { Colors, Radius } from '../theme';

const AMENITY_META: Record<Amenity, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  banheiro:   { icon: 'water-outline',       label: 'Banheiro' },
  loja:       { icon: 'storefront-outline',  label: 'Loja' },
  lavagem:    { icon: 'car-outline',         label: 'Lavagem' },
  troca_oleo: { icon: 'construct-outline',   label: 'Troca de óleo' },
  restaurante:{ icon: 'restaurant-outline',  label: 'Restaurante' },
  wifi:       { icon: 'wifi-outline',        label: 'Wi-Fi' },
};

export function AmenityChip({ amenity }: { amenity: Amenity }) {
  const meta = AMENITY_META[amenity];
  return (
    <View style={styles.chip}>
      <Ionicons name={meta.icon} size={13} color={Colors.primary} />
      <Text style={styles.label}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: { color: Colors.textSecondary, fontSize: 12 },
});
