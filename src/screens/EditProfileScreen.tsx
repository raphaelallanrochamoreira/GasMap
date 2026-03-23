import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { updateProfile } from '../store/slices/appSlice';
import { SettingsStackParamList } from '../types';

type Props = StackScreenProps<SettingsStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { userName, userEmail } = useAppSelector(s => s.app);

  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar vazio.');
      return;
    }
    dispatch(updateProfile({ name: name.trim(), email: email.trim() }));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar perfil</Text>
      </View>

      <View style={styles.form}>
        {/* Avatar placeholder */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.textMuted} />
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhoto}>Alterar foto</Text>
          </TouchableOpacity>
        </View>

        <Label>Nome</Label>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
        />

        <Label>E-mail</Label>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor={Colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Salvar alterações</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
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
  form: { padding: Spacing.lg, gap: Spacing.sm },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.md, gap: 10 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  changePhoto: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
