import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStorage } from '../hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { DesktopEstabelecimentoView } from '@/components/ui/DesktopEstabelecimentoView';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

export default function EstabelecimentoScreen() {
  const { id } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const estabelecimento = groupedItems[id as string];
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isDesktop } = useWebLayout();

  // Se for desktop, mostrar a versão desktop
  if (isDesktop) {
    return <DesktopEstabelecimentoView />;
  }

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
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={tw('px-4 pt-6 pb-4')}>
        <Text style={[tw('text-2xl font-bold mb-2'), { color: colors.text }]}>
          {id}
        </Text>
        <View style={tw('flex-row items-center')}>
          <MaterialIcons name="store" size={20} color={colors.secondary} />
          <Text style={[tw('text-xl ml-2 font-semibold'), { color: colors.secondary }]}>
            Total: R$ {formatarPreco(estabelecimento.valor_total)}
          </Text>
        </View>
      </Animated.View>

      <FlatList
        data={Object.entries(estabelecimento.compras).sort(([dateA], [dateB]) => sortDates(dateA, dateB))}
        keyExtractor={([date]) => date}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: [date, dados], index }) => (
          <Animated.View entering={FadeInDown.delay(100 + index * 50)}>
            <TouchableOpacity
              style={tw('mb-3')}
              onPress={() => {
                const dataFormatada = formatarDataParaRota(date);
                console.log('Navegando para data formatada:', dataFormatada);
                router.push(`estabelecimento/${id}/data/${dataFormatada}`);
              }}
            >
              <Card variant="elevated">
                <View style={tw('p-4')}>
                  <View style={tw('flex-row items-center justify-between mb-3')}>
                    <View style={tw('flex-row items-center')}>
                      <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                      <Text style={[tw('text-lg font-semibold ml-2'), { color: colors.text }]}>
                        {formatarData(date)}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                  </View>
                  
                  <View style={tw('flex-row items-center justify-between')}>
                    <View style={tw('flex-row items-center')}>
                      <MaterialIcons name="attach-money" size={18} color={colors.secondary} />
                      <Text style={[tw('text-base font-medium'), { color: colors.secondary }]}>
                        R$ {formatarPreco(dados.valor_total)}
                      </Text>
                    </View>
                    
                    <View style={tw('flex-row items-center')}>
                      <MaterialIcons name="shopping-cart" size={16} color={colors.textSecondary} />
                      <Text style={[tw('text-sm ml-1'), { color: colors.textSecondary }]}>
                        {dados.itens.length} itens
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}