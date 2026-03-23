import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { Colors } from '../theme';
import { RootTabParamList } from '../types';
import { MapStack } from './MapStack';
import { SettingsStack } from './SettingsStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 82 : 60,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="MapTab"
          component={MapStack}
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
