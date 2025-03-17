import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStorage } from '../hooks/useStorage';

export default function EstabelecimentoScreen() {
  const { id } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const estabelecimento = groupedItems[id as string];

  if (!estabelecimento) return null;

  const formatarPreco = (valor: number) => {
    return (Math.floor(valor * 100) / 100).toFixed(2);
  };

  const formatarData = (dataString: string) => {
    // Retornar a data exatamente como está armazenada, sem conversões
    return dataString;
  };

  const formatarDataParaRota = (data: string) => {
    return encodeURIComponent(data);
  };

  const sortDates = (a: string, b: string) => {
    const [diaA, mesA, anoA] = a.split('/').map(Number);
    const [diaB, mesB, anoB] = b.split('/').map(Number);
    
    const dateA = new Date(anoA, mesA - 1, diaA);
    const dateB = new Date(anoB, mesB - 1, diaB);
    
    return dateB.getTime() - dateA.getTime(); // Ordem decrescente
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id}</Text>
      <Text style={styles.total}>
        Total: R$ {formatarPreco(estabelecimento.valor_total)}
      </Text>

      <FlatList
        data={Object.entries(estabelecimento.compras).sort(([dateA], [dateB]) => sortDates(dateA, dateB))}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, dados] }) => (
          <TouchableOpacity 
            style={styles.dateCard}
            onPress={() => {
              const dataFormatada = formatarDataParaRota(date);
              console.log('Navegando para data formatada:', dataFormatada);
              router.push(`estabelecimento/${id}/data/${dataFormatada}`);
            }}
          >
            <Text style={styles.dateText}>
              {formatarData(date)}
            </Text>
            <Text style={styles.dateTotal}>
              Total: R$ {formatarPreco(dados.valor_total)}
            </Text>
            <Text style={styles.itemCount}>
              {dados.itens.length} itens
            </Text>
          </TouchableOpacity>
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
  total: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 24,
  },
  dateCard: {
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
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateTotal: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
});
