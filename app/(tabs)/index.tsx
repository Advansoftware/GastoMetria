import React, { useState, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useStorage } from '../hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card } from '@/components/ui/Card';
import { StatsGrid } from '@/components/ui/StatsCard';
import { ModernButton } from '@/components/ui/ModernButton';
import { AdaptiveCameraButton } from '@/components/ui/AdaptiveCameraButton';
import { WebDemoData } from '@/components/ui/WebDemoData';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';
import { usePlatformCapabilities } from '@/hooks/usePlatform';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('month');
  const { groupedItems, items, loadItems, clearStorage, removeEstabelecimento } = useStorage();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isWeb, isMobile, hasCamera } = usePlatformCapabilities();

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'all': return 'Todos os períodos';
      case 'today': return 'Hoje';
      case 'week': return 'Esta semana';
      case 'month': return 'Este mês';
      default: return '';
    }
  };

  // Filtrar itens por período
  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') return items;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return items.filter(item => {
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      
      switch (selectedFilter) {
        case 'today':
          return itemDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [items, selectedFilter]);

  // Agrupar itens filtrados por estabelecimento
  const filteredGroupedItems = useMemo(() => {
    const grouped: Record<string, any> = {};
    
    filteredItems.forEach(item => {
      if (!grouped[item.estabelecimento]) {
        grouped[item.estabelecimento] = {
          total_compras: 0,
          valor_total: 0,
          ultima_compra: item.data
        };
      }
      
      grouped[item.estabelecimento].total_compras += 1;
      grouped[item.estabelecimento].valor_total += item.valor_total;
      
      if (!grouped[item.estabelecimento].ultima_compra || 
          new Date(item.data.split('/').reverse().join('-')) > 
          new Date(grouped[item.estabelecimento].ultima_compra.split('/').reverse().join('-'))) {
        grouped[item.estabelecimento].ultima_compra = item.data;
      }
    });

    return grouped;
  }, [filteredItems]);

  // Estatísticas principais
  const mainStats = useMemo(() => {
    const totalGasto = filteredItems.reduce((sum, item) => sum + item.valor_total, 0);
    const totalCompras = filteredItems.length;
    const mediaCompra = totalCompras > 0 ? totalGasto / totalCompras : 0;
    const estabelecimentosUnicos = new Set(filteredItems.map(item => item.estabelecimento)).size;

    return [
      {
        title: 'Total Gasto',
        value: `R$ ${formatarPreco(totalGasto)}`,
        icon: 'attach-money' as const,
        color: colors.primary,
        subtitle: getFilterLabel()
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
        value: `R$ ${formatarPreco(mediaCompra)}`,
        icon: 'timeline' as const,
        color: colors.accent,
        subtitle: totalCompras > 0 ? `${totalCompras} compras` : 'Nenhuma compra'
      },
      {
        title: 'Categorias',
        value: new Set(filteredItems.map(item => item.categoria)).size.toString(),
        icon: 'category' as const,
        color: colors.warning,
        subtitle: 'diferentes'
      }
    ];
  }, [filteredItems, selectedFilter, colors]);

  const handleClearData = () => {
    Alert.alert(
      "Limpar Dados",
      "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            await clearStorage();
            loadItems();
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleDeleteEstabelecimento = (estabelecimento: string) => {
    Alert.alert(
      "Excluir Estabelecimento",
      `Deseja realmente excluir todos os dados de ${estabelecimento}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => removeEstabelecimento(estabelecimento)
        }
      ]
    );
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      style={[
        tw("px-4 py-2 rounded-full mr-2"),
        {
          backgroundColor: selectedFilter === filter ? colors.primary : colors.surfaceVariant
        }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text 
        style={[
          tw("text-sm font-medium"),
          {
            color: selectedFilter === filter ? colors.onPrimary : colors.onSurfaceVariant
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEstabelecimentoCard = ({ item: [estabelecimento, dados], index }: any) => (
    <Animated.View entering={FadeInDown.delay(400 + index * 100)}>
      <Card variant="elevated" style={tw('mb-3')}>
        <TouchableOpacity
          style={tw('flex-1')}
          onPress={() => router.push(`/estabelecimento/${estabelecimento}`)}
        >
          <View style={tw('flex-row items-center justify-between')}>
            <View style={tw('flex-1')}>
              <Text style={[tw('text-lg font-bold'), { color: colors.text }]}>
                {estabelecimento}
              </Text>
            </View>
            <TouchableOpacity
              style={tw('p-2')}
              onPress={() => handleDeleteEstabelecimento(estabelecimento)}
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          
          <View style={tw('flex-row justify-between items-end')}>
            <View>
              <Text style={[tw('text-2xl font-bold'), { color: colors.primary }]}>
                R$ {formatarPreco(dados.valor_total)}
              </Text>
              <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                {dados.total_compras} compras
              </Text>
            </View>
            <View style={tw('items-end')}>
              <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                {dados.ultima_compra}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  if (Object.keys(groupedItems).length === 0) {
    return (
      <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
        <ScrollView
          style={tw('flex-1')}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown}>
            <View style={tw('px-4 py-6')}>
              <Text style={[tw('text-3xl font-bold'), { color: colors.text }]}>
                GastoMetria
              </Text>
              <Text style={[tw('text-lg'), { color: colors.textSecondary }]}>
                Controle seus gastos de forma inteligente
              </Text>
            </View>
          </Animated.View>

          {/* Web Demo Data */}
          {isWeb && (
            <Animated.View entering={FadeInDown.delay(200)}>
              <WebDemoData onAddDemoData={loadItems} />
            </Animated.View>
          )}

          {/* Empty State */}
          <Animated.View entering={FadeInDown.delay(isWeb ? 400 : 200)}>
            <View style={tw('flex-1 justify-center items-center py-20 px-4')}>
              <MaterialIcons name="receipt-long" size={80} color={colors.textSecondary} />
              <Text style={[tw('text-xl font-bold text-center mb-2'), { color: colors.text }]}>
                {isWeb ? 'Bem-vindo ao GastoMetria' : 'Nenhuma nota fiscal encontrada'}
              </Text>
              <Text style={[tw('text-base text-center mb-6'), { color: colors.textSecondary }]}>
                {isWeb 
                  ? 'Visualize suas funcionalidades ou adicione dados de demonstração'
                  : 'Escaneie o QR Code de uma nota fiscal para começar'
                }
              </Text>
              
              <AdaptiveCameraButton size="lg" fullWidth />
              
              {isMobile && (
                <Text style={[tw('text-sm text-center mt-4'), { color: colors.textSecondary }]}>
                  Aponte a câmera para o QR Code da nota fiscal
                </Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView
        style={tw('flex-1')}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown}>
          <View style={tw('px-4 py-6')}>
            <Text style={[tw('text-3xl font-bold'), { color: colors.text }]}>
              GastoMetria
            </Text>
            <Text style={[tw('text-lg'), { color: colors.textSecondary }]}>
              Controle seus gastos de forma inteligente
            </Text>
          </View>
        </Animated.View>

        {/* Filtros */}
        <Animated.View entering={FadeInRight.delay(200)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw('px-4 mb-5')}>
            {renderFilterButton('all', 'Todos')}
            {renderFilterButton('today', 'Hoje')}
            {renderFilterButton('week', '7 dias')}
            {renderFilterButton('month', '30 dias')}
          </ScrollView>
        </Animated.View>

        {/* Estatísticas */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <StatsGrid stats={mainStats} columns={2} />
        </Animated.View>

        {/* Lista de Estabelecimentos */}
        <View style={tw('px-4 mb-6')}>
          <View style={tw('flex-row justify-between items-center')}>
            <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
              Estabelecimentos ({Object.keys(filteredGroupedItems).length})
            </Text>
            <ModernButton
              variant="outline"
              size="sm"
              leftIcon="delete"
              onPress={handleClearData}
            >
              Limpar
            </ModernButton>
          </View>
          
          {Object.keys(filteredGroupedItems).length === 0 ? (
            <Card variant="outlined" style={tw('py-8')}>
              <Text style={[tw('text-center text-lg'), { color: colors.textSecondary }]}>
                Nenhum estabelecimento encontrado para o período selecionado
              </Text>
            </Card>
          ) : (
            <FlatList
              data={Object.entries(filteredGroupedItems)}
              keyExtractor={([estabelecimento]) => estabelecimento}
              renderItem={renderEstabelecimentoCard}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={tw('h-20')} />
      </ScrollView>

      {/* Floating Action Button - Only show on mobile */}
      {isMobile && hasCamera && (
        <TouchableOpacity
          style={[
            tw('absolute bottom-5 right-5 w-14 h-14 rounded-full justify-center items-center'),
            { 
              backgroundColor: colors.primary,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }
          ]}
          onPress={() => router.push('/camera')}
        >
          <View style={tw('flex-row items-center')}>
            <MaterialIcons name="qr-code-scanner" size={24} color={colors.onPrimary} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeScreen;
