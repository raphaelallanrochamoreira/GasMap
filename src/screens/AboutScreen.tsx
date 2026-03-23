import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '../theme';
import { SettingsStackParamList } from '../types';

type Props = StackScreenProps<SettingsStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sobre o GasMap</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="flash" size={52} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>GasMap</Text>
        <Text style={styles.version}>Versão 1.0.0 · Expo SDK 51</Text>

        <Text style={styles.description}>
          GasMap é um aplicativo de mapa de postos de gasolina com preços
          atualizados pela comunidade. Encontre o combustível mais barato perto
          de você de forma rápida e simples.
        </Text>

        <View style={styles.linkCard}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://gasmap.com.br/privacidade')}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.linkText}>Política de privacidade</Text>
            <Ionicons name="open-outline" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://gasmap.com.br/termos')}
          >
            <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
            <Text style={styles.linkText}>Termos de uso</Text>
            <Ionicons name="open-outline" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://github.com/seu-usuario/gasmap')}
          >
            <Ionicons name="logo-github" size={18} color={Colors.primary} />
            <Text style={styles.linkText}>Código-fonte (GitHub)</Text>
            <Ionicons name="open-outline" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.credits}>Feito com ❤️ no Brasil 🇧🇷</Text>
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
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.lg,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  version: { color: Colors.textMuted, fontSize: 13 },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  linkCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  linkText: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.lg },
  credits: { color: Colors.textMuted, fontSize: 13, marginTop: Spacing.lg },
});
