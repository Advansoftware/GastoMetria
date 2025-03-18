import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useStorage } from '../hooks/useStorage';
import ChartStats from '@/components/ChartStats';
import { useFocusEffect } from 'expo-router';

export default function RelatorioScreen() {
  const { items, groupedItems, loadItems } = useStorage();
  const loadItemsRef = React.useRef(loadItems);

  React.useEffect(() => {
    loadItemsRef.current = loadItems;
  }, [loadItems]);

  useFocusEffect(
    React.useCallback(() => {
      loadItemsRef.current();
    }, []) // Dependência vazia para evitar recriações
  );

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
