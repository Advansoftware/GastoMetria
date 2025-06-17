import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStorage } from '@/app/hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatCard } from '@/components/ui/StatsCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

export function DesktopEstabelecimentoView() {
  const { id } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const estabelecimento = groupedItems[id as string];
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!estabelecimento) {
    return (
      <View style={[tw('flex-1 justify-center items-center'), { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={64} color={colors.textSecondary} />
        <Text style={[tw('text-lg mt-4'), { color: colors.textSecondary }]}>
          Estabelecimento não encontrado
        </Text>
      </View>
    );
  }

  const formatarPreco = (valor: number) => {
    return (Math.floor(valor * 100) / 100).toFixed(2);
  };

  const formatarData = (dataString: string) => {
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
    
    return dateB.getTime() - dateA.getTime();
  };

  const comprasOrdenadas = Object.entries(estabelecimento.compras)
    .sort(([dateA], [dateB]) => sortDates(dateA, dateB));

  const estatisticas = [
    {
      title: 'Total Geral',
      value: `R$ ${formatarPreco(estabelecimento.valor_total)}`,
      icon: 'attach-money' as const,
      color: colors.primary
    },
    {
      title: 'Número de Compras',
      value: comprasOrdenadas.length.toString(),
      icon: 'shopping-cart' as const,
      color: colors.secondary
    },
    {
      title: 'Média por Compra',
      value: `R$ ${formatarPreco(estabelecimento.valor_total / comprasOrdenadas.length)}`,
      icon: 'analytics' as const,
      color: colors.accent
    },
    {
      title: 'Total de Itens',
      value: Object.values(estabelecimento.compras)
        .reduce((total, compra) => total + compra.itens.length, 0).toString(),
      icon: 'inventory' as const,
      color: colors.warning
    }
  ];

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
          <Text style={[tw('text-lg mb-6'), { color: colors.textSecondary }]}>
            Histórico completo de compras
          </Text>
        </Animated.View>

        {/* Estatísticas */}
        <Animated.View entering={FadeInDown.delay(200)}>
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

        {/* Lista de Compras */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
            Histórico de Compras ({comprasOrdenadas.length})
          </Text>

          <View style={tw('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4')}>
            {comprasOrdenadas.map(([date, dados], index) => (
              <Animated.View key={date} entering={FadeInDown.delay(400 + index * 50)}>
                <TouchableOpacity
                  onPress={() => {
                    const dataFormatada = formatarDataParaRota(date);
                    router.push(`/estabelecimento/${id}/data/${dataFormatada}`);
                  }}
                >
                  <Card variant="elevated" style={tw('h-full')}>
                    <View style={tw('p-4')}>
                      <View style={tw('flex-row items-center justify-between mb-4')}>
                        <View style={tw('flex-row items-center')}>
                          <View style={[
                            tw('w-10 h-10 rounded-full justify-center items-center mr-3'),
                            { backgroundColor: colors.primaryContainer }
                          ]}>
                            <MaterialIcons 
                              name="calendar-today" 
                              size={20} 
                              color={colors.onPrimaryContainer} 
                            />
                          </View>
                          <View>
                            <Text style={[tw('text-lg font-semibold'), { color: colors.text }]}>
                              {formatarData(date)}
                            </Text>
                            <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                              {dados.itens.length} itens
                            </Text>
                          </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                      </View>
                      
                      <View style={tw('flex-row items-center justify-between')}>
                        <View>
                          <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                            Total da Compra
                          </Text>
                          <Text style={[tw('text-xl font-bold'), { color: colors.primary }]}>
                            R$ {formatarPreco(dados.valor_total)}
                          </Text>
                        </View>
                        
                        <View style={tw('items-end')}>
                          <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                            Valor Médio/Item
                          </Text>
                          <Text style={[tw('text-base font-medium'), { color: colors.secondary }]}>
                            R$ {formatarPreco(dados.valor_total / dados.itens.length)}
                          </Text>
                        </View>
                      </View>

                      {/* Preview dos primeiros itens */}
                      <View style={tw('mt-4 pt-4 border-t border-gray-100')}>
                        <Text style={[tw('text-xs mb-2'), { color: colors.textSecondary }]}>
                          Primeiros itens:
                        </Text>
                        {dados.itens.slice(0, 3).map((item, itemIndex) => (
                          <Text 
                            key={itemIndex}
                            style={[tw('text-xs truncate'), { color: colors.text }]}
                          >
                            • {item.produto}
                          </Text>
                        ))}
                        {dados.itens.length > 3 && (
                          <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                            ... e mais {dados.itens.length - 3} itens
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
