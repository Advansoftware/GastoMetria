import React, { useState, useMemo } from 'react';
import { ScrollView, Text, RefreshControl } from 'react-native';
import { useStorage } from '../hooks/useStorage';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { ModernChart } from '@/components/ui/ModernChart';
import { StatsGrid } from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';
import { Picker } from '@react-native-picker/picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';
import { useWebLayout } from '@/hooks/useWebLayout';
import { WebReportsPage } from '@/components/ui/WebReportsPage';

export default function RelatorioScreen() {
  // IMPORTANT: All hooks must be called before any conditional rendering
  const { items, loadItems } = useStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { isDesktop } = useWebLayout();

  // Focus effect hook
  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  // Filter items by time period
  const filteredItems = useMemo(() => {
    if (timeFilter === 'all') return items;

    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return items;
    }

    return items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      return itemDate >= startDate;
    });
  }, [items, timeFilter]);

  // Main statistics
  const mainStats = useMemo(() => {
    const totalGasto = filteredItems.reduce((sum, item) => sum + item.valor_total, 0);
    const totalCompras = filteredItems.length;
    const mediaCompra = totalCompras > 0 ? totalGasto / totalCompras : 0;
    const estabelecimentosUnicos = new Set(filteredItems.map(item => item.estabelecimento)).size;

    return [
      {
        title: 'Total Gasto',
        value: `R$ ${totalGasto.toFixed(2)}`,
        icon: 'attach-money' as const,
        color: colors.primary
      },
      {
        title: 'Compras',
        value: totalCompras.toString(),
        icon: 'shopping-cart' as const,
        color: colors.secondary,
        subtitle: `${estabelecimentosUnicos} estabelecimentos`
      },
      {
        title: 'Média/Compra',
        value: `R$ ${mediaCompra.toFixed(2)}`,
        icon: 'timeline' as const,
        color: colors.accent
      },
      {
        title: 'Categorias',
        value: new Set(filteredItems.map(item => item.categoria)).size.toString(),
        icon: 'category' as const,
        color: colors.warning,
        subtitle: 'diferentes'
      }
    ];
  }, [filteredItems, colors]);

  // Category chart data
  const categoryData = useMemo(() => {
    if (filteredItems.length === 0) return [];

    const categoryColors = [
      colors.primary,
      colors.secondary, 
      colors.accent,
      colors.warning,
      '#EC4899',
      '#10B981',
      '#F59E0B',
      '#8B5CF6'
    ];

    const categoryTotals: Record<string, number> = {};

    filteredItems.forEach(item => {
      const categoria = item.categoria || 'Outros';
      categoryTotals[categoria] = (categoryTotals[categoria] || 0) + item.valor_total;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: categoryColors[index % categoryColors.length],
        legendFontColor: colors.text,
        legendFontSize: 12,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredItems, colors]);

  // Store chart data
  const storeData = useMemo(() => {
    if (filteredItems.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const storeTotals: Record<string, number> = {};

    filteredItems.forEach(item => {
      storeTotals[item.estabelecimento] = (storeTotals[item.estabelecimento] || 0) + item.valor_total;
    });

    const sortedEntries = Object.entries(storeTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);

    const labels = sortedEntries.map(([name]) => 
      name.length > 15 ? name.substring(0, 15) + '...' : name
    );
    const data = sortedEntries.map(([,value]) => value);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => colors.secondary,
      }]
    };
  }, [filteredItems, colors]);

  // If desktop, show web reports page - AFTER all hooks
  if (isDesktop) {
    return <WebReportsPage />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

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
          {/* Main Statistics */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <StatsGrid stats={mainStats} columns={2} />
          </Animated.View>

          {/* Category Chart */}
          {categoryData && categoryData.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)}>
              <ModernChart
                title="Gastos por Categoria"
                type="pie"
                data={categoryData}
                height={220}
              />
            </Animated.View>
          )}

          {/* Store Chart */}
          {storeData.labels && storeData.labels.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400)}>
              <ModernChart
                title="Gastos por Estabelecimento"
                type="bar"
                data={storeData}
                height={200}
              />
            </Animated.View>
          )}

          {/* Insights */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <Card variant="elevated" style={tw('mx-4 mt-4 mb-8')}>
              <Text style={[tw('text-xl font-semibold mb-3'), { color: colors.text }]}>
                Insights
              </Text>
              
              {categoryData.length > 0 && (
                <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                  • Categoria que mais gasta: {categoryData[0]?.name} (R$ {categoryData[0]?.value.toFixed(2)})
                </Text>
              )}
              
              {storeData.labels.length > 0 && (
                <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                  • Estabelecimento favorito: {storeData.labels[0]}
                </Text>
              )}
            </Card>
          </Animated.View>
        </>
      )}
    </ScrollView>
  );
}
