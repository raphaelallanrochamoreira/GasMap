import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useAppSelector, useAppDispatch } from '../store';
import { setOnlyOpen, setOnlyFavorites } from '../store/slices/appSlice';
import { RootTabParamList, SettingsStackParamList } from '../types';
import { FUEL_LABELS } from '../utils/fuel';

type Props = CompositeScreenProps<
  StackScreenProps<SettingsStackParamList, 'Settings'>,
  BottomTabScreenProps<RootTabParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { filters, userFavoriteFuel, userName, userEmail } = useAppSelector(
    s => s.app,
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>Configurações</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.85}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={Colors.textMuted} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName || 'Visitante'}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {userEmail || 'Toque para editar o perfil'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* App preferences */}
        <SectionHeader title="Preferências do app" />
        <View style={styles.card}>
          <SettingRow
            icon="flame-outline"
            label="Combustível favorito"
            value={FUEL_LABELS[userFavoriteFuel]}
            onPress={() => navigation.navigate('FuelPreferences')}
          />
          <Divider />
          <SettingSwitch
            icon="business-outline"
            label="Apenas postos abertos"
            value={filters.onlyOpen}
            onValueChange={v => dispatch(setOnlyOpen(v))}
          />
          <Divider />
          <SettingSwitch
            icon="heart-outline"
            label="Apenas favoritos"
            value={filters.onlyFavorites}
            onValueChange={v => dispatch(setOnlyFavorites(v))}
          />
        </View>

        {/* About */}
        <SectionHeader title="Sobre" />
        <View style={styles.card}>
          <SettingRow
            icon="information-circle-outline"
            label="Sobre o GasMap"
            onPress={() => navigation.navigate('About')}
          />
          <Divider />
          <SettingRow
            icon="star-outline"
            label="Avaliar o app"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="bug-outline"
            label="Reportar problema"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.version}>GasMap v1.0.0 · Expo SDK 51</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={sStyles.header}>{title}</Text>;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  labelColor,
  showChevron = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  labelColor?: string;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      style={sStyles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text
        style={[sStyles.label, labelColor ? { color: labelColor } : {}]}
      >
        {label}
      </Text>
      {value && <Text style={sStyles.value}>{value}</Text>}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

function SettingSwitch({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={sStyles.row}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={[sStyles.label, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary + '66' }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: Colors.border, marginLeft: 52 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  version: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: Spacing.xl,
  },
});

const sStyles = StyleSheet.create({
  header: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  label: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  value: { color: Colors.textMuted, fontSize: 13 },
});
