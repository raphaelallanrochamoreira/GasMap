import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export function RatingStars({ rating, total }: { rating: number; total: number }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#FBBF24"
        />
      ))}
      <Text style={styles.text}>
        {rating.toFixed(1)} ({total} avaliações)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  text: { color: Colors.textMuted, fontSize: 12, marginLeft: 6 },
});
