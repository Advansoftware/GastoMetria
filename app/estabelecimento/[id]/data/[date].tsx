import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStorage } from '../../../hooks/useStorage';

export default function DataDetailScreen() {
  const { id, date } = useLocalSearchParams();
  const decodedDate = decodeURIComponent(date as string);
  const { groupedItems } = useStorage();
  
  console.log('Parâmetros:', { id, decodedDate }); // Debug
  console.log('Estabelecimento:', groupedItems[id as string]); // Debug
  
  const estabelecimento = groupedItems[id as string];
  const compraData = estabelecimento?.compras[decodedDate];

  console.log('Dados da compra:', compraData); // Debug

  if (!estabelecimento || !compraData) {
    console.log('Dados não encontrados'); // Debug
    return null;
  }

  const formatarPreco = (valor: number) => {
    return (Math.floor(valor * 100) / 100).toFixed(2);
  };

  const formatarData = (dataString: string) => {
    // Retornar a data exatamente como está armazenada, sem conversões
    return dataString;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{id}</Text>
        <Text style={styles.date}>{formatarData(decodedDate)}</Text>
        <Text style={styles.total}>
          Total: R$ {formatarPreco(compraData.valor_total)}
        </Text>
      </View>

      <FlatList
        data={compraData.itens}
        keyExtractor={(item, index) => `${item.produto}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.produto}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.quantity}>
                Quantidade: {item.quantidade}
              </Text>
              <Text style={styles.price}>
                Valor un.: R$ {formatarPreco(item.valor_unitario)}
              </Text>
              <Text style={styles.itemTotal}>
                Total: R$ {formatarPreco(item.quantidade * item.valor_unitario)}
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
  header: {
    marginBottom: 20,
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
    marginBottom: 16,
  },
  itemCard: {
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
  itemName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    marginTop: 8,
  },
  quantity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  }
});
