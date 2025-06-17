import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useStorage } from '@/app/hooks/useStorage';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { ModernChart } from '@/components/ui/ModernChart';
import { StatCard } from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';
import { DesktopLayout } from '@/components/ui/DesktopLayout';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';
import { MaterialIcons } from '@expo/vector-icons';

export function WebReportsPage() {
  const { items, groupedItems, loadItems } = useStorage();
  const [refreshing, setRefreshing] = useState(false);
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  // Estatísticas avançadas
  const advancedStats = useMemo(() => {
    const totalGasto = items.reduce((sum, item) => sum + item.valor_total, 0);
    const totalItens = items.length;
    const estabelecimentosUnicos = Object.keys(groupedItems).length;
    const categoriasUnicas = new Set(items.map(item => item.categoria)).size;

    // Análises temporais
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

    const gastoUltimos7Dias = items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      return itemDate >= seteDiasAtras;
    }).reduce((sum, item) => sum + item.valor_total, 0);

    const gastoUltimos30Dias = items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      return itemDate >= trintaDiasAtras;
    }).reduce((sum, item) => sum + item.valor_total, 0);

    const mediaGastoDiario = gastoUltimos30Dias / 30;
    const mediaMensal = gastoUltimos30Dias;

    return [
      {
        title: 'Total Acumulado',
        value: `R$ ${totalGasto.toFixed(2)}`,
        icon: 'account-balance-wallet' as const,
        color: colors.primary,
        subtitle: `${totalItens} transações`
      },
      {
        title: 'Últimos 30 Dias',
        value: `R$ ${mediaMensal.toFixed(2)}`,
        icon: 'calendar-month' as const,
        color: colors.secondary,
        subtitle: 'período atual'
      },
      {
        title: 'Média Diária',
        value: `R$ ${mediaGastoDiario.toFixed(2)}`,
        icon: 'today' as const,
        color: colors.accent,
        subtitle: 'últimos 30 dias'
      },
      {
        title: 'Locais Únicos',
        value: estabelecimentosUnicos.toString(),
        icon: 'store' as const,
        color: colors.warning,
        subtitle: 'estabelecimentos'
      },
      {
        title: 'Categorias',
        value: categoriasUnicas.toString(),
        icon: 'category' as const,
        color: colors.error,
        subtitle: 'diferentes'
      },
      {
        title: 'Últimos 7 Dias',
        value: `R$ ${gastoUltimos7Dias.toFixed(2)}`,
        icon: 'trending-up' as const,
        color: colors.accent,
        subtitle: 'período recente'
      }
    ];
  }, [items, groupedItems, colors]);

  // Dados para análise temporal detalhada
  const detailedTimelineData = useMemo(() => {
    const dailyTotals: Record<string, number> = {};

    items.forEach(item => {
      const date = item.data;
      dailyTotals[date] = (dailyTotals[date] || 0) + item.valor_total;
    });

    const sortedDates = Object.keys(dailyTotals).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    return {
      labels: sortedDates.slice(-30).map(date => {
        const [day, month] = date.split('/');
        return `${day}/${month}`;
      }),
      datasets: [{
        data: sortedDates.slice(-30).map(date => dailyTotals[date]),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 3,
      }]
    };
  }, [items, colors]);

  // Dados para análise por estabelecimento (top 10)
  const establishmentAnalysis = useMemo(() => {
    const establishments = Object.entries(groupedItems)
      .sort(([, a], [, b]) => b.valor_total - a.valor_total)
      .slice(0, 10);

    return {
      labels: establishments.map(([name]) => 
        name.length > 12 ? name.substring(0, 12) + '...' : name
      ),
      datasets: [{
        data: establishments.map(([, data]) => data.valor_total),
        color: (opacity = 1) => colors.secondary,
      }]
    };
  }, [groupedItems, colors]);

  // Análise por categoria
  const categoryAnalysis = useMemo(() => {
    const categoryTotals: Record<string, { total: number; color: string }> = {};
    const categoryColors = [
      colors.primary,
      colors.secondary,
      colors.accent,
      colors.warning,
      '#EC4899',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EF4444',
      '#06B6D4'
    ];

    items.forEach(item => {
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

    return Object.entries(categoryTotals)
      .map(([name, data]) => ({
        name,
        value: data.total,
        color: data.color,
        legendFontColor: colors.text,
        legendFontSize: 12,
      }))
      .sort((a, b) => b.value - a.value);
  }, [items, colors]);

  if (items.length === 0) {
    return (
      <View style={[tw('flex-1 justify-center items-center p-8'), { backgroundColor: colors.background }]}>
        <MaterialIcons name="assessment" size={80} color={colors.textSecondary} />
        <Text style={[tw('text-2xl font-bold mt-4 mb-2'), { color: colors.onSurface }]}>
          Relatórios Vazios
        </Text>
        <Text style={[tw('text-center text-lg'), { color: colors.onSurfaceVariant }]}>
          Adicione algumas compras para gerar relatórios detalhados
        </Text>
      </View>
    );
  }

  return (
    <DesktopLayout>
      <ScrollView 
        style={[tw('flex-1'), { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      <View style={tw('p-6')}>
        {/* Header */}
        <Animated.View entering={FadeInDown}>
          <Text style={[tw('text-3xl font-bold mb-2'), { color: colors.onSurface }]}>
            Relatórios Avançados
          </Text>
          <Text style={[tw('text-lg mb-6'), { color: colors.onSurfaceVariant }]}>
            Análise detalhada dos seus gastos
          </Text>
        </Animated.View>

        {/* Estatísticas Avançadas */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={tw('flex-row flex-wrap mb-8')}>
            {advancedStats.map((stat, index) => (
              <View key={stat.title} style={tw('w-1/3 pr-3 mb-4')}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  subtitle={stat.subtitle}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Gráficos de Análise */}
        <View style={tw('mb-8')}>
          {/* Linha superior */}
          <View style={tw('flex-row mb-6')}>
            {/* Tendência Diária */}
            <Animated.View entering={FadeInDown.delay(300)} style={tw('flex-1 mr-4')}>
              <ModernChart
                title="Tendência Diária (Últimos 30 Dias)"
                type="line"
                data={detailedTimelineData}
                height={300}
              />
            </Animated.View>

            {/* Análise por Categoria */}
            <Animated.View entering={FadeInDown.delay(400)} style={tw('flex-1')}>
              <ModernChart
                title="Distribuição por Categoria"
                type="pie"
                data={categoryAnalysis}
                height={300}
              />
            </Animated.View>
          </View>

          {/* Gráfico de Estabelecimentos */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <ModernChart
              title="Top 10 Estabelecimentos"
              type="bar"
              data={establishmentAnalysis}
              height={350}
            />
          </Animated.View>
        </View>

        {/* Insights Detalhados */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Card variant="elevated" style={tw('p-6')}>
            <Text style={[tw('text-xl font-bold mb-4'), { color: colors.onSurface }]}>
              Insights Detalhados
            </Text>

            {/* Estabelecimento que mais gasta */}
            {Object.keys(groupedItems).length > 0 && (
              <View style={tw('mb-4 p-4 bg-blue-50 rounded-lg')}>
                <Text style={[tw('font-semibold mb-2'), { color: colors.primary }]}>
                  🏪 Estabelecimento Favorito
                </Text>
                <Text style={[tw('text-sm'), { color: colors.onSurfaceVariant }]}>
                  {Object.entries(groupedItems)
                    .sort(([, a], [, b]) => b.valor_total - a.valor_total)[0]?.[0]} - 
                  R$ {Object.entries(groupedItems)
                    .sort(([, a], [, b]) => b.valor_total - a.valor_total)[0]?.[1].valor_total.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Categoria que mais gasta */}
            {categoryAnalysis.length > 0 && (
              <View style={tw('mb-4 p-4 bg-green-50 rounded-lg')}>
                <Text style={[tw('font-semibold mb-2'), { color: colors.secondary }]}>
                  📊 Categoria Principal
                </Text>
                <Text style={[tw('text-sm'), { color: colors.onSurfaceVariant }]}>
                  {categoryAnalysis[0]?.name} - R$ {categoryAnalysis[0]?.value.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Frequência de compras */}
            <View style={tw('p-4 bg-yellow-50 rounded-lg')}>
              <Text style={[tw('font-semibold mb-2'), { color: colors.warning }]}>
                📈 Frequência de Compras
              </Text>
              <Text style={[tw('text-sm'), { color: colors.onSurfaceVariant }]}>
                {items.length} compras registradas em {Object.keys(groupedItems).length} estabelecimentos diferentes
              </Text>
            </View>
          </Card>
        </Animated.View>
      </View>
    </ScrollView>
    </DesktopLayout>
  );
}
