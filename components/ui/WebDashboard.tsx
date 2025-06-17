import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStorage } from '@/app/hooks/useStorage';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ModernChart } from '@/components/ui/ModernChart';
import { StatCard } from '@/components/ui/StatsCard';
import { DesktopLayout } from '@/components/ui/DesktopLayout';
import { tw } from '@/utils/tailwind';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export function WebDashboard() {
  const { items, groupedItems } = useStorage();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dashboardStats = useMemo(() => {
    const totalGasto = items.reduce((sum, item) => sum + item.valor_total, 0);
    const totalCompras = items.length;
    const estabelecimentosUnicos = Object.keys(groupedItems).length;
    const mediaCompra = totalCompras > 0 ? totalGasto / totalCompras : 0;

    // Cálculo do último mês
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    
    const ultimoMes = items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      return itemDate >= umMesAtras;
    });

    const gastoUltimoMes = ultimoMes.reduce((sum, item) => sum + item.valor_total, 0);

    return [
      {
        title: 'Total Geral',
        value: `R$ ${totalGasto.toFixed(2)}`,
        icon: 'account-balance-wallet' as const,
        color: colors.primary,
        subtitle: `${totalCompras} compras registradas`
      },
      {
        title: 'Último Mês',
        value: `R$ ${gastoUltimoMes.toFixed(2)}`,
        icon: 'trending-up' as const,
        color: colors.secondary,
        subtitle: `${ultimoMes.length} compras`
      },
      {
        title: 'Estabelecimentos',
        value: estabelecimentosUnicos.toString(),
        icon: 'store' as const,
        color: colors.accent,
        subtitle: 'locais diferentes'
      },
      {
        title: 'Média por Compra',
        value: `R$ ${mediaCompra.toFixed(2)}`,
        icon: 'analytics' as const,
        color: colors.warning,
        subtitle: 'valor médio'
      }
    ];
  }, [items, groupedItems, colors]);

  // Dados para gráfico de gastos mensais
  const monthlyData = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    
    items.forEach(item => {
      const date = new Date(item.data.split('/').reverse().join('-'));
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + item.valor_total;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
    });

    return {
      labels: sortedMonths.slice(-6), // Últimos 6 meses
      datasets: [{
        data: sortedMonths.slice(-6).map(month => monthlyTotals[month]),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 3,
      }]
    };
  }, [items, colors]);

  // Dados para gráfico de categorias
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
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

    items.forEach(item => {
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
      .slice(0, 6);
  }, [items, colors]);

  // Top estabelecimentos
  const topEstabelecimentos = useMemo(() => {
    return Object.entries(groupedItems)
      .sort(([, a], [, b]) => b.valor_total - a.valor_total)
      .slice(0, 5);
  }, [groupedItems]);

  if (items.length === 0) {
    return (
      <View style={[tw('flex-1 justify-center items-center p-8'), { backgroundColor: colors.background }]}>
        <MaterialIcons name="dashboard" size={80} color={colors.textSecondary} />
        <Text style={[tw('text-2xl font-bold mt-4 mb-2'), { color: colors.onSurface }]}>
          Dashboard Vazio
        </Text>
        <Text style={[tw('text-center text-lg'), { color: colors.onSurfaceVariant }]}>
          Adicione algumas compras para ver suas estatísticas aqui
        </Text>
      </View>
    );
  }

  return (
    <DesktopLayout>
      <ScrollView style={[tw('flex-1'), { backgroundColor: colors.background }]}>
        <View style={tw('p-8 max-w-7xl mx-auto w-full')}>
          {/* Header */}
          <Animated.View entering={FadeInDown}>
            <Text style={[tw('text-4xl font-bold mb-3'), { color: colors.onSurface }]}>
              Dashboard
            </Text>
            <Text style={[tw('text-xl mb-8'), { color: colors.onSurfaceVariant }]}>
              Visão geral dos seus gastos
            </Text>
          </Animated.View>

        {/* Cards de Estatísticas */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={tw('flex flex-row flex-wrap -mx-3 mb-8')}>
            {dashboardStats.map((stat, index) => (
              <Animated.View 
                key={stat.title} 
                entering={FadeInDown.delay(300 + index * 100)}
                style={tw('w-1/2 lg:w-1/3 px-3 mb-6')}
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  subtitle={stat.subtitle}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Gráficos */}
        <View style={tw('flex flex-col lg:flex-row gap-6 mb-8')}>
          {/* Gráfico de Tendência */}
          <Animated.View entering={FadeInRight.delay(500)} style={tw('flex-1')}>
            <ModernChart
              title="Tendência Mensal"
              type="line"
              data={monthlyData}
              height={320}
            />
          </Animated.View>

          {/* Gráfico de Categorias */}
          <Animated.View entering={FadeInRight.delay(600)} style={tw('flex-1')}>
            <ModernChart
              title="Gastos por Categoria"
              type="pie"
              data={categoryData}
              height={320}
            />
          </Animated.View>
        </View>

        {/* Top Estabelecimentos */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Card variant="elevated" style={tw('p-6')}>
            <Text style={[tw('text-xl font-bold mb-4'), { color: colors.onSurface }]}>
              Top Estabelecimentos
            </Text>
            
            {topEstabelecimentos.map(([nome, dados], index) => (
              <View key={nome} style={tw('flex-row items-center justify-between py-3 border-b border-gray-100')}>
                <View style={tw('flex-row items-center flex-1')}>
                  <View style={[
                    tw('w-8 h-8 rounded-full justify-center items-center mr-3'),
                    { backgroundColor: colors.primaryContainer }
                  ]}>
                    <Text style={[tw('font-bold'), { color: colors.onPrimaryContainer }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={tw('flex-1')}>
                    <Text style={[tw('font-semibold'), { color: colors.onSurface }]}>
                      {nome}
                    </Text>
                    <Text style={[tw('text-sm'), { color: colors.onSurfaceVariant }]}>
                      {Object.keys(dados.compras).length} compras
                    </Text>
                  </View>
                </View>
                <Text style={[tw('font-bold text-lg'), { color: colors.primary }]}>
                  R$ {dados.valor_total.toFixed(2)}
                </Text>
              </View>
            ))}
          </Card>
        </Animated.View>
      </View>
    </ScrollView>
    </DesktopLayout>
  );
}
