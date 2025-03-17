import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Select, MenuItem } from '@/components/ui/select';
import { PurchaseItem } from '../types/storage';

type StatsType = 'produtos' | 'estabelecimentos' | 'categorias';

interface ChartStatsProps {
  items: PurchaseItem[];
}

const ChartStats: React.FC<ChartStatsProps> = ({ items }) => {
  const [statsType, setStatsType] = React.useState<StatsType>('produtos');
  const [data, setData] = React.useState<Array<{ label: string; value: number }>>([]);

  const processData = React.useCallback(() => {
    if (!items.length) return;

    const aggregateData = items.reduce<Record<string, number>>((acc, item) => {
      const key = statsType === 'produtos' ? item.produto :
                 statsType === 'estabelecimentos' ? item.estabelecimento :
                 item.categoria;
      acc[key] = (acc[key] || 0) + item.valor_total;
      return acc;
    }, {});

    const sortedData = Object.entries(aggregateData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([label, value]) => ({
        label: label.length > 20 ? `${label.substring(0, 20)}...` : label,
        value
      }));

    setData(sortedData);
  }, [items, statsType]);

  React.useEffect(() => {
    processData();
  }, [processData]);

  const maxValue = Math.max(...data.map(item => item.value), 0);

  return (
    <View style={styles.container}>
      <Select
        value={statsType}
        onChange={setStatsType}
        label="Tipo de Estatística"
      >
        <MenuItem label="Produtos" value="produtos" />
        <MenuItem label="Estabelecimentos" value="estabelecimentos" />
        <MenuItem label="Categorias" value="categorias" />
      </Select>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chart}>
          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <Text style={styles.value}>R$ {item.value.toFixed(2)}</Text>
              <View style={styles.barWrapper}>
                <View style={[
                  styles.bar,
                  { height: (item.value / maxValue) * 200 }
                ]} />
              </View>
              <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 16,
    minWidth: Dimensions.get('window').width - 32,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 200,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    backgroundColor: '#6750A4',
    borderRadius: 10,
    minHeight: 2,
  },
  value: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    width: 60,
  }
});

export default ChartStats;