import React from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useStorage } from '../../../hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { DesktopDataDetailView } from '@/components/ui/DesktopDataDetailView';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';
import { StatCard } from '@/components/ui/StatsCard';
import { PurchaseItem } from '@/app/types/storage';

export default function DataDetailScreen() {
  const { id, date } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isDesktop } = useWebLayout();

  // Se for desktop, mostrar a versão desktop
  if (isDesktop) {
    return <DesktopDataDetailView />;
  }

  // Decodificar a data da URL
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

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50)}>
      <Card variant="elevated" style={tw('mb-3')}>
        <View style={tw('p-4')}>
          <View style={tw('flex-row items-center justify-between mb-3')}>
            <View style={tw('flex-1 flex-row items-center')}>
              <View style={[
                tw('w-10 h-10 rounded-full justify-center items-center mr-3'),
                { backgroundColor: colors.primaryContainer }
              ]}>
                <MaterialIcons 
                  name={getCategoriaIcon(item.categoria)} 
                  size={20} 
                  color={colors.onPrimaryContainer} 
                />
              </View>
              <View style={tw('flex-1')}>
                <Text style={[tw('text-base font-semibold'), { color: colors.text }]} numberOfLines={2}>
                  {item.produto}
                </Text>
                {item.categoria && (
                  <Text style={[tw('text-sm mt-1'), { color: colors.textSecondary }]}>
                    {item.categoria}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={tw('flex-row justify-between items-center')}>
            <View>
              <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                Quantidade
              </Text>
              <Text style={[tw('text-base font-medium'), { color: colors.text }]}>
                {item.quantidade_total}x
              </Text>
            </View>

            <View style={tw('items-center')}>
              <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                Valor Unitário
              </Text>
              <Text style={[tw('text-base font-medium'), { color: colors.text }]}>
                R$ {formatarPreco(item.valor_unitario)}
              </Text>
            </View>

            <View style={tw('items-end')}>
              <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                Total
              </Text>
              <Text style={[tw('text-lg font-bold'), { color: colors.primary }]}>
                R$ {formatarPreco(item.valor_total_produto)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `${id} - ${formatarData(decodedDate)}`,
          headerShown: true 
        }} 
      />
      
      <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
        <ScrollView style={tw('flex-1')}>
          {/* Header com informações da compra */}
          <Animated.View entering={FadeInDown} style={tw('px-4 pt-6 pb-4')}>
            <View style={tw('flex-row items-center mb-2')}>
              <MaterialIcons name="store" size={24} color={colors.primary} />
              <Text style={[tw('text-2xl font-bold ml-2'), { color: colors.text }]}>
                {id}
              </Text>
            </View>
            
            <View style={tw('flex-row items-center')}>
              <MaterialIcons name="calendar-today" size={20} color={colors.secondary} />
              <Text style={[tw('text-lg ml-2'), { color: colors.secondary }]}>
                {formatarData(decodedDate)}
              </Text>
            </View>
          </Animated.View>

          {/* Estatísticas */}
          <Animated.View entering={FadeInRight.delay(200)} style={tw('px-4 mb-6')}>
            <View style={tw('flex-row flex-wrap justify-between')}>
              {estatisticas.map((stat, index) => (
                <View key={stat.title} style={tw('w-[48%] mb-3')}>
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

          {/* Lista de produtos */}
          <View style={tw('px-4')}>
            <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
              Produtos ({itensUnicos.length})
            </Text>
            
            <FlatList
              data={itensUnicos}
              keyExtractor={(item: any, index: number) => `${item.produto}-${index}`}
              renderItem={renderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Espaçamento final */}
          <View style={tw('h-8')} />
        </ScrollView>
      </View>
    </>
  );
}