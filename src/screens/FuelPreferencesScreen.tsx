import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { setFavoriteFuel } from '../store/slices/appSlice';
import { FuelType, SettingsStackParamList } from '../types';
import { ALL_FUELS, FUEL_LABELS, BRAND_COLORS } from '../utils/fuel';

const FUEL_COLORS: Record<FuelType, string> = {
  gasolina: '#F59E0B',
  gasolina_aditivada: '#F97316',
  etanol: '#10B981',
  diesel: '#6366F1',
  diesel_s10: '#8B5CF6',
  gnv: '#3B82F6',
};

type Props = StackScreenProps<SettingsStackParamList, 'FuelPreferences'>;

export function FuelPreferencesScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const favFuel = useAppSelector(s => s.app.userFavoriteFuel);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Combustível favorito</Text>
      </View>

      <Text style={styles.subtitle}>
        O preço deste combustível será destacado nos marcadores do mapa.
      </Text>

      <View style={styles.list}>
        {ALL_FUELS.map((fuel, i) => {
          const isSelected = favFuel === fuel;
          const color = FUEL_COLORS[fuel];
          return (
            <View key={fuel}>
              <TouchableOpacity
                style={[styles.row, isSelected && { backgroundColor: color + '18' }]}
                onPress={() => {
                  dispatch(setFavoriteFuel(fuel));
                  navigation.goBack();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text
                  style={[
                    styles.label,
                    isSelected && { color: color, fontWeight: '700' },
                  ]}
                >
                  {FUEL_LABELS[fuel]}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={color} />
                )}
              </TouchableOpacity>
              {i < ALL_FUELS.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    lineHeight: 18,
  },
  list: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 15,
    gap: Spacing.md,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  label: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.lg },
});
