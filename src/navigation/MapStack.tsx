import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MapStackParamList } from '../types';
import { MapScreen } from '../screens/MapScreen';
import { StationDetailScreen } from '../screens/StationDetailScreen';

const Stack = createStackNavigator<MapStackParamList>();

export function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="StationDetail" component={StationDetailScreen} />
    </Stack.Navigator>
  );
}
