import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStorage } from '../hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { StatsGrid } from '@/components/ui/StatsCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { DesktopEstabelecimentoView } from '@/components/ui/DesktopEstabelecimentoView';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

export default function EstabelecimentoScreen() {
  const { id } = useLocalSearchParams();
  const { groupedItems } = useStorage();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isDesktop } = useWebLayout();
  
  const estabelecimento = groupedItems[id as string];

  // Estatísticas calculadas
  const stats = useMemo(() => {
    if (!estabelecimento) return [];
    
    const datas = Object.keys(estabelecimento.compras);
    const totalCompras = datas.length;
    const mediaGastoPorCompra = estabelecimento.valor_total / totalCompras;
    
    // Data da primeira e última compra
    const datasOrdenadas = datas.sort((a, b) => {
      const [diaA, mesA, anoA] = a.split('/').map(Number);
      const [diaB, mesB, anoB] = b.split('/').map(Number);
      const dateA = new Date(anoA, mesA - 1, diaA);
      const dateB = new Date(anoB, mesB - 1, diaB);
      return dateA.getTime() - dateB.getTime();
    });
    
    const primeiraCompra = datasOrdenadas[0];
    const ultimaCompra = datasOrdenadas[datasOrdenadas.length - 1];
    
    // Calcular período de frequência
    let frequenciaTexto = 'Primeira vez';
    let frequenciaSubtitle = 'Cliente novo';
    
    if (totalCompras > 1) {
      const diasEntrePrimeiraeUltima = Math.ceil(
        (new Date(ultimaCompra.split('/').reverse().join('-')).getTime() - 
         new Date(primeiraCompra.split('/').reverse().join('-')).getTime()) / (1000 * 60 * 60 * 24)
      );
      const frequenciaDias = diasEntrePrimeiraeUltima / (totalCompras - 1);
      
      if (frequenciaDias <= 7) {
        frequenciaTexto = 'Semanal';
        frequenciaSubtitle = 'Cliente assíduo';
      } else if (frequenciaDias <= 15) {
        frequenciaTexto = 'Quinzenal';
        frequenciaSubtitle = 'Cliente regular';
      } else if (frequenciaDias <= 35) {
        frequenciaTexto = 'Mensal';
        frequenciaSubtitle = 'Cliente habitual';
      } else {
        frequenciaTexto = 'Esporádica';
        frequenciaSubtitle = 'Cliente eventual';
      }
    }

    // Análise do ticket médio
    let ticketAnalise = 'Gasto baixo';
    if (mediaGastoPorCompra > 100) {
      ticketAnalise = 'Gasto alto';
    } else if (mediaGastoPorCompra > 50) {
      ticketAnalise = 'Gasto médio';
    }

    // Análise de fidelidade
    let fidelidadeTexto = 'Novo cliente';
    if (totalCompras >= 10) {
      fidelidadeTexto = 'Cliente fiel';
    } else if (totalCompras >= 5) {
      fidelidadeTexto = 'Cliente frequente';
    } else if (totalCompras >= 3) {
      fidelidadeTexto = 'Cliente regular';
    }
    
    const formatarPreco = (valor: number) => {
      return (Math.floor(valor * 100) / 100).toFixed(2);
    };
    
    return [
      {
        title: 'Total Gasto',
        value: `R$ ${formatarPreco(estabelecimento.valor_total)}`,
        icon: 'attach-money' as const,
        color: colors.primary,
        subtitle: fidelidadeTexto
      },
      {
        title: 'Ticket Médio',
        value: `R$ ${formatarPreco(mediaGastoPorCompra)}`,
        icon: 'trending-up' as const,
        color: colors.secondary,
        subtitle: ticketAnalise
      },
      {
        title: 'Frequência',
        value: frequenciaTexto,
        icon: 'schedule' as const,
        color: colors.accent,
        subtitle: frequenciaSubtitle
      },
      {
        title: 'Última Visita',
        value: ultimaCompra,
        icon: 'event' as const,
        color: colors.warning,
        subtitle: `${totalCompras} ${totalCompras === 1 ? 'visita' : 'visitas'}`
      }
    ];
  }, [estabelecimento, colors]);

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
      <ScrollView style={tw('flex-1')}>
        {/* Header com botão de voltar */}
        <Animated.View entering={FadeInDown} style={tw('px-4 pt-6 pb-4')}>
          <View style={tw('flex-row items-center mb-4')}>
            <TouchableOpacity 
              style={[
                tw('w-10 h-10 rounded-full items-center justify-center mr-3'),
                { backgroundColor: colors.primaryContainer }
              ]}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.onPrimaryContainer} />
            </TouchableOpacity>
            
            <View style={tw('flex-1')}>
              <Text style={[tw('text-2xl font-bold'), { color: colors.text }]} numberOfLines={1}>
                {id}
              </Text>
              <View style={tw('flex-row items-center mt-1')}>
                <MaterialIcons name="store" size={16} color={colors.textSecondary} />
                <Text style={[tw('text-sm ml-1'), { color: colors.textSecondary }]}>
                  Estabelecimento
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Cards de Estatísticas */}
        <Animated.View entering={FadeInRight.delay(200)}>
          <StatsGrid stats={stats} columns={2} />
        </Animated.View>

        {/* Lista de Compras por Data */}
        <View style={tw('px-4 mb-6')}>
          <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
            Histórico de Compras ({Object.keys(estabelecimento.compras).length})
          </Text>
          
          <FlatList
            data={Object.entries(estabelecimento.compras).sort(([dateA], [dateB]) => sortDates(dateA, dateB))}
            keyExtractor={([date]) => date}
            renderItem={({ item: [date, dados], index }) => (
              <Animated.View entering={FadeInDown.delay(300 + index * 50)}>
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
                          <View style={[
                            tw('w-10 h-10 rounded-full items-center justify-center mr-3'),
                            { backgroundColor: colors.secondaryContainer }
                          ]}>
                            <MaterialIcons name="calendar-today" size={20} color={colors.onSecondaryContainer} />
                          </View>
                          <View>
                            <Text style={[tw('text-lg font-semibold'), { color: colors.text }]}>
                              {formatarData(date)}
                            </Text>
                            <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                              {dados.itens.length} {dados.itens.length === 1 ? 'item' : 'itens'}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={tw('items-end')}>
                          <Text style={[tw('text-lg font-bold'), { color: colors.primary }]}>
                            R$ {formatarPreco(dados.valor_total)}
                          </Text>
                          <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Espaçamento final */}
        <View style={tw('h-8')} />
      </ScrollView>
    </View>
  );
}