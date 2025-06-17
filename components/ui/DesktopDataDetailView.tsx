import React from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStorage } from '@/app/hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { StatCard } from '@/components/ui/StatsCard';
import { PurchaseItem } from '@/app/types/storage';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

export function DesktopDataDetailView() {
  const { id, date } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const decodedDate = decodeURIComponent(date as string);
  const estabelecimento = groupedItems[id as string];
  const dadosData = estabelecimento?.compras[decodedDate];

  const formatarPreco = (valor: number) => {
    return (Math.floor(valor * 100) / 100).toFixed(2);
  };

  const formatarData = (dataString: string) => {
    return dataString;
  };

  if (!estabelecimento || !dadosData) {
    return (
      <View style={[tw('flex-1 justify-center items-center'), { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={64} color={colors.textSecondary} />
        <Text style={[tw('text-lg mt-4'), { color: colors.textSecondary }]}>
          Dados não encontrados
        </Text>
      </View>
    );
  }

  const itensAgrupados = dadosData.itens.reduce((acc: Record<string, any>, item: PurchaseItem) => {
    const key = item.produto;
    if (!acc[key]) {
      acc[key] = {
        ...item,
        quantidade_total: 0,
        valor_total_produto: 0
      };
    }
    acc[key].quantidade_total += item.quantidade;
    acc[key].valor_total_produto += item.valor_total;
    return acc;
  }, {} as Record<string, any>);

  const itensUnicos = Object.values(itensAgrupados);

  const estatisticas = [
    {
      title: 'Total da Compra',
      value: `R$ ${formatarPreco(dadosData.valor_total)}`,
      icon: 'attach-money' as const,
      color: colors.primary
    },
    {
      title: 'Total de Itens',
      value: dadosData.itens.length.toString(),
      icon: 'shopping-cart' as const,
      color: colors.secondary
    },
    {
      title: 'Produtos Únicos',
      value: itensUnicos.length.toString(),
      icon: 'inventory' as const,
      color: colors.accent
    },
    {
      title: 'Valor Médio/Item',
      value: `R$ ${formatarPreco(dadosData.valor_total / dadosData.itens.length)}`,
      icon: 'analytics' as const,
      color: colors.warning
    }
  ];

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria?.toLowerCase()) {
      case 'alimentacao': case 'alimentos': return 'restaurant';
      case 'bebidas': return 'local-bar';
      case 'limpeza': return 'cleaning-services';
      case 'higiene': return 'soap';
      case 'casa': return 'home';
      case 'eletronicos': return 'devices';
      case 'roupas': return 'checkroom';
      case 'saude': return 'health-and-safety';
      default: return 'category';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colorMap: Record<string, string> = {
      'alimentacao': colors.primary,
      'alimentos': colors.primary,
      'bebidas': colors.secondary,
      'limpeza': colors.accent,
      'higiene': colors.warning,
      'casa': colors.accent,
      'eletronicos': colors.error,
      'roupas': '#EC4899',
      'saude': '#10B981'
    };
    return colorMap[categoria?.toLowerCase()] || colors.textSecondary;
  };

  return (
    <ScrollView style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <View style={tw('p-6')}>
        {/* Header */}
        <Animated.View entering={FadeInDown}>
          <View style={tw('flex-row items-center mb-2')}>
            <MaterialIcons name="store" size={32} color={colors.primary} />
            <Text style={[tw('text-3xl font-bold ml-3'), { color: colors.text }]}>
              {id}
            </Text>
          </View>
          
          <View style={tw('flex-row items-center mb-6')}>
            <MaterialIcons name="calendar-today" size={24} color={colors.secondary} />
            <Text style={[tw('text-xl ml-2'), { color: colors.secondary }]}>
              {formatarData(decodedDate)}
            </Text>
          </View>
        </Animated.View>

        {/* Estatísticas */}
        <Animated.View entering={FadeInRight.delay(200)}>
          <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
            Resumo da Compra
          </Text>
          <View style={tw('flex-row flex-wrap mb-8')}>
            {estatisticas.map((stat, index) => (
              <View key={stat.title} style={tw('w-1/4 pr-3 mb-4')}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Lista de produtos em grid */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
            Produtos Comprados ({itensUnicos.length})
          </Text>
          
          <View style={tw('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4')}>
            {itensUnicos.map((item: any, index: number) => (
              <Animated.View key={`${item.produto}-${index}`} entering={FadeInDown.delay(400 + index * 50)}>
                <Card variant="elevated" style={tw('h-full')}>
                  <View style={tw('p-4')}>
                    <View style={tw('flex-row items-start mb-4')}>
                      <View style={[
                        tw('w-12 h-12 rounded-full justify-center items-center mr-3 flex-shrink-0'),
                        { backgroundColor: getCategoriaColor(item.categoria) + '20' }
                      ]}>
                        <MaterialIcons 
                          name={getCategoriaIcon(item.categoria)} 
                          size={24} 
                          color={getCategoriaColor(item.categoria)}
                        />
                      </View>
                      <View style={tw('flex-1')}>
                        <Text style={[tw('text-base font-semibold leading-5'), { color: colors.text }]} numberOfLines={2}>
                          {item.produto}
                        </Text>
                        {item.categoria && (
                          <Text style={[tw('text-sm mt-1'), { color: colors.textSecondary }]}>
                            {item.categoria}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={tw('space-y-3')}>
                      <View style={tw('flex-row justify-between items-center')}>
                        <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                          Quantidade
                        </Text>
                        <Text style={[tw('text-base font-medium'), { color: colors.text }]}>
                          {item.quantidade_total}x
                        </Text>
                      </View>

                      <View style={tw('flex-row justify-between items-center')}>
                        <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                          Valor Unitário
                        </Text>
                        <Text style={[tw('text-base font-medium'), { color: colors.text }]}>
                          R$ {formatarPreco(item.valor_unitario)}
                        </Text>
                      </View>

                      <View style={[tw('flex-row justify-between items-center pt-2 border-t'), { borderColor: colors.border }]}>
                        <Text style={[tw('text-base font-medium'), { color: colors.textSecondary }]}>
                          Total
                        </Text>
                        <Text style={[tw('text-xl font-bold'), { color: colors.primary }]}>
                          R$ {formatarPreco(item.valor_total_produto)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Resumo por categoria */}
        <Animated.View entering={FadeInDown.delay(500)} style={tw('mt-8')}>
          <Card variant="elevated" style={tw('p-6')}>
            <Text style={[tw('text-xl font-bold mb-4'), { color: colors.text }]}>
              Resumo por Categoria
            </Text>
            
            {Object.entries(
              itensUnicos.reduce((acc: Record<string, { total: number; count: number }>, item: any) => {
                const categoria = item.categoria || 'Outros';
                if (!acc[categoria]) {
                  acc[categoria] = { total: 0, count: 0 };
                }
                acc[categoria].total += item.valor_total_produto;
                acc[categoria].count += 1;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([categoria, dados], index) => (
                <View key={categoria} style={tw('flex-row items-center justify-between py-3 border-b border-gray-100')}>
                  <View style={tw('flex-row items-center flex-1')}>
                    <View style={[
                      tw('w-8 h-8 rounded-full justify-center items-center mr-3'),
                      { backgroundColor: getCategoriaColor(categoria) + '20' }
                    ]}>
                      <MaterialIcons 
                        name={getCategoriaIcon(categoria)} 
                        size={16} 
                        color={getCategoriaColor(categoria)}
                      />
                    </View>
                    <View style={tw('flex-1')}>
                      <Text style={[tw('font-semibold'), { color: colors.text }]}>
                        {categoria}
                      </Text>
                      <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                        {dados.count} {dados.count === 1 ? 'produto' : 'produtos'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[tw('font-bold text-lg'), { color: colors.primary }]}>
                    R$ {dados.total.toFixed(2)}
                  </Text>
                </View>
              ))}
          </Card>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
