import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useStorage } from '../hooks/useStorage';
import ChartStats from '@/components/ChartStats';

export default function RelatorioScreen() {
  const { items, groupedItems } = useStorage();

  return (
    <View style={styles.container}>
      <ChartStats items={items} groupedItems={groupedItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
});
