import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStorage } from '../hooks/useStorage';

export default function EstabelecimentoScreen() {
  const { id } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const estabelecimento = groupedItems[id as string];

  console.log('Detalhes do estabelecimento:', estabelecimento);

  if (!estabelecimento) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id}</Text>
      <Text style={styles.date}>
        {new Date(estabelecimento.data).toLocaleDateString()}
      </Text>
      <Text style={styles.total}>
        Total: R$ {estabelecimento.valor_total.toFixed(2)}
      </Text>
      <Text style={styles.subtitle}>
        Total de Itens: {estabelecimento.itens.length}
      </Text>

      <FlatList
        data={estabelecimento.itens}
        keyExtractor={(item, index) => `${item.produto}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.produto}</Text>
            <View style={styles.productDetails}>
              <Text style={styles.quantity}>
                Quantidade: {item.quantidade}
              </Text>
              <Text style={styles.price}>
                Valor un.: R$ {item.valor_unitario.toFixed(2)}
              </Text>
              <Text style={styles.totalPrice}>
                Total: R$ {item.valor_total.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  total: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  productDetails: {
    marginTop: 8,
  },
  totalPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  }
});
