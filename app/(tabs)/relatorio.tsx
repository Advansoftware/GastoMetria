import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useStorage } from '../hooks/useStorage';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ModernChart } from '@/components/ui/ModernChart';
import { StatsGrid, StatCard } from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';
import { Picker } from '@react-native-picker/picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';
import { usePlatformCapabilities } from '@/hooks/usePlatform';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

export default function RelatorioScreen() {
  const { items, groupedItems, loadItems } = useStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isWeb, isMobile } = usePlatformCapabilities();

  const loadItemsRef = React.useRef(loadItems);

  React.useEffect(() => {
    loadItemsRef.current = loadItems;
  }, [loadItems]);

  useFocusEffect(
    React.useCallback(() => {
      loadItemsRef.current();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  // Filtrar itens por período
  const filteredItems = useMemo(() => {
    if (timeFilter === 'all') return items;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeFilter) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }

    return items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      return itemDate >= cutoffDate;
    });
  }, [items, timeFilter]);

  // Estatísticas principais
  const mainStats = useMemo(() => {
    const totalGasto = filteredItems.reduce((sum, item) => sum + item.valor_total, 0);
    const totalItens = filteredItems.length;
    const mediaCompra = filteredItems.length > 0 ? totalGasto / filteredItems.length : 0;
    const estabelecimentosUnicos = new Set(filteredItems.map(item => item.estabelecimento)).size;

    // Cálculo de tendência (comparando com período anterior)
    const previousPeriodItems = items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (timeFilter) {
        case '7d':
          endDate.setDate(now.getDate() - 7);
          startDate.setDate(now.getDate() - 14);
          break;
        case '30d':
          endDate.setDate(now.getDate() - 30);
          startDate.setDate(now.getDate() - 60);
          break;
        case '3m':
          endDate.setMonth(now.getMonth() - 3);
          startDate.setMonth(now.getMonth() - 6);
          break;
        default:
          return false;
      }

      return itemDate >= startDate && itemDate < endDate;
    });

    const previousTotal = previousPeriodItems.reduce((sum, item) => sum + item.valor_total, 0);
    const trend = previousTotal > 0 ? ((totalGasto - previousTotal) / previousTotal) * 100 : 0;

    return [
      {
        title: 'Total Gasto',
        value: `R$ ${totalGasto.toFixed(2)}`,
        icon: 'attach-money' as const,
        color: colors.primary,
        trend: trend > 0 ? 'up' as const : trend < 0 ? 'down' as const : 'neutral' as const,
        trendValue: `${Math.abs(trend).toFixed(1)}%`
      },
      {
        title: 'Compras',
        value: filteredItems.length.toString(),
        icon: 'shopping-cart' as const,
        color: colors.secondary,
        subtitle: `${estabelecimentosUnicos} estabelecimentos`
      },
      {
        title: 'Média por Compra',
        value: `R$ ${mediaCompra.toFixed(2)}`,
        icon: 'timeline' as const,
        color: colors.accent
      },
      {
        title: 'Total de Itens',
        value: totalItens.toString(),
        icon: 'inventory' as const,
        color: colors.warning
      }
    ];
  }, [filteredItems, items, timeFilter, colors]);

  // Dados para gráfico de gastos por categoria
  const categoryData = useMemo(() => {
    if (filteredItems.length === 0) {
      return [];
    }

    // Paleta de cores para diferentes categorias
    const categoryColors = [
      colors.primary,
      colors.secondary, 
      colors.accent,
      colors.warning,
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#8B5CF6', // Violet
      '#EF4444', // Red
      '#06B6D4', // Cyan
    ];

    const categoryTotals: Record<string, { total: number; color: string }> = {};

    filteredItems.forEach((item, index) => {
      const categoria = item.categoria || 'Outros';
      if (!categoryTotals[categoria]) {
        const colorIndex = Object.keys(categoryTotals).length % categoryColors.length;
        categoryTotals[categoria] = { 
          total: 0, 
          color: categoryColors[colorIndex] 
        };
      }
      categoryTotals[categoria].total += item.valor_total;
    });

    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) {
      return [];
    }

    return entries
      .map(([name, data]) => ({
        name,
        value: data.total,
        color: data.color,
        legendFontColor: colors.text,
        legendFontSize: 12,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categorias
  }, [filteredItems, colors]);

  // Dados para gráfico de tendência temporal
  const timelineData = useMemo(() => {
    if (filteredItems.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const dailyTotals: Record<string, number> = {};

    filteredItems.forEach(item => {
      const date = item.data;
      dailyTotals[date] = (dailyTotals[date] || 0) + item.valor_total;
    });

    const sortedDates = Object.keys(dailyTotals).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    if (sortedDates.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const labels = sortedDates.map(date => {
      const [day, month] = date.split('/');
      return `${day}/${month}`;
    });

    const data = sortedDates.map(date => dailyTotals[date]);

    return {
      labels: labels.slice(-10), // Últimos 10 pontos
      datasets: [{
        data: data.slice(-10),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 3,
      }]
    };
  }, [filteredItems, colors]);

  // Dados para gráfico de estabelecimentos
  const storeData = useMemo(() => {
    if (filteredItems.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const storeTotals: Record<string, number> = {};

    filteredItems.forEach(item => {
      storeTotals[item.estabelecimento] = (storeTotals[item.estabelecimento] || 0) + item.valor_total;
    });

    const labels = Object.keys(storeTotals).slice(0, 6); // Top 6 estabelecimentos
    
    if (labels.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const data = labels.map(store => storeTotals[store]);

    return {
      labels: labels.map(name => name.length > 15 ? name.substring(0, 15) + '...' : name),
      datasets: [{
        data,
        color: (opacity = 1) => colors.secondary,
      }]
    };
  }, [filteredItems, colors]);

  return (
    <ScrollView 
      style={[tw('flex-1'), { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)}
        style={tw('mx-4 mt-6 mb-6')}
      >
        <Text style={[tw('text-3xl font-bold mb-4'), { color: colors.text }]}>
          Relatórios
        </Text>
        
        <Card variant="outlined" style={tw('mb-2')}>
          <Picker
            selectedValue={timeFilter}
            onValueChange={setTimeFilter}
            style={{ height: 40, color: colors.text }}
          >
            <Picker.Item label="Últimos 7 dias" value="7d" />
            <Picker.Item label="Últimos 30 dias" value="30d" />
            <Picker.Item label="Últimos 3 meses" value="3m" />
            <Picker.Item label="Todos os períodos" value="all" />
          </Picker>
        </Card>
      </Animated.View>

      {filteredItems.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card variant="elevated" style={tw('mx-4 py-12')}>
            <Text style={[tw('text-lg text-center'), { color: colors.textSecondary }]}>
              Nenhum dado encontrado para o período selecionado
            </Text>
          </Card>
        </Animated.View>
      ) : (
        <>
          {/* Estatísticas principais */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <StatsGrid stats={mainStats} columns={2} />
          </Animated.View>

          {/* Gráfico de tendência temporal */}
          {timelineData.labels && timelineData.labels.length > 1 && 
           timelineData.datasets && timelineData.datasets[0] && 
           timelineData.datasets[0].data && timelineData.datasets[0].data.length > 1 && (
            <Animated.View entering={FadeInDown.delay(300)}>
              <ModernChart
                title="Tendência de Gastos"
                type="line"
                data={timelineData}
                height={200}
              />
            </Animated.View>
          )}

          {/* Gráfico de gastos por categoria */}
          {categoryData && categoryData.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400)}>
              <ModernChart
                title="Gastos por Categoria"
                type="pie"
                data={categoryData}
                height={220}
              />
            </Animated.View>
          )}

          {/* Gráfico de gastos por estabelecimento */}
          {storeData.labels && storeData.labels.length > 0 && 
           storeData.datasets && storeData.datasets[0] && 
           storeData.datasets[0].data && storeData.datasets[0].data.length > 0 && (
            <Animated.View entering={FadeInDown.delay(500)}>
              <ModernChart
                title="Gastos por Estabelecimento"
                type="bar"
                data={storeData}
                height={200}
              />
            </Animated.View>
          )}

          {/* Insights adicionais */}
          <Animated.View entering={FadeInDown.delay(600)}>
            <Card variant="elevated" style={tw('mx-4 mt-4 mb-8')}>
              <Text style={[tw('text-xl font-semibold mb-3'), { color: colors.text }]}>
                Insights
              </Text>
              
              {categoryData.length > 0 && (
                <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                  • Categoria que mais gasta: {categoryData[0]?.name} (R$ {categoryData[0]?.value.toFixed(2)})
                </Text>
              )}
              
              {filteredItems.length > 0 && (
                <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                  • Estabelecimento favorito: {Object.keys(
                    filteredItems.reduce((acc, item) => {
                      acc[item.estabelecimento] = (acc[item.estabelecimento] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort((a, b) => 
                    filteredItems.filter(item => item.estabelecimento === b).length - 
                    filteredItems.filter(item => item.estabelecimento === a).length
                  )[0]}
                </Text>
              )}
            </Card>
          </Animated.View>
        </>
      )}
    </ScrollView>
  );
}
