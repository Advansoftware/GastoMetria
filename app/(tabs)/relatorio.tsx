import React, { useState, useMemo } from 'react';
import { ScrollView, Text, RefreshControl, View, TouchableOpacity, TextInput } from 'react-native';
import { useStorage } from '../hooks/useStorage';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { ModernChart } from '@/components/ui/ModernChart';
import { StatsGrid } from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
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
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'products' | 'establishments'>('overview');
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { isDesktop } = useWebLayout();

  // Função para mudança de aba com limpeza de filtros
  const handleViewModeChange = (newMode: 'overview' | 'products' | 'establishments') => {
    setViewMode(newMode);
    // Limpar filtros ao mudar de aba
    setProductSearch('');
    setSelectedEstablishment('all');
  };

  // Focus effect hook
  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  // Filter items by time period and additional filters
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Time filter
    if (timeFilter !== 'all') {
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
          startDate = new Date(0);
      }

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data.split('/').reverse().join('-'));
        return itemDate >= startDate;
      });
    }

    // Product search filter
    if (productSearch.trim() !== '') {
      filtered = filtered.filter(item => 
        item.produto.toLowerCase().includes(productSearch.toLowerCase().trim())
      );
    }

    // Establishment filter
    if (selectedEstablishment !== 'all') {
      filtered = filtered.filter(item => item.estabelecimento === selectedEstablishment);
    }

    return filtered;
  }, [items, timeFilter, productSearch, selectedEstablishment]);

  // Get unique products and establishments for filters
  const uniqueProducts = useMemo(() => {
    const products = new Set(items.map(item => item.produto));
    return Array.from(products).sort();
  }, [items]);

  const uniqueEstablishments = useMemo(() => {
    const establishments = new Set(items.map(item => item.estabelecimento));
    return Array.from(establishments).sort();
  }, [items]);

  // Product analysis data
  const productData = useMemo(() => {
    if (filteredItems.length === 0) return [];

    const productTotals: Record<string, { value: number; quantity: number; establishments: Set<string> }> = {};

    filteredItems.forEach(item => {
      if (!productTotals[item.produto]) {
        productTotals[item.produto] = { 
          value: 0, 
          quantity: 0, 
          establishments: new Set() 
        };
      }
      productTotals[item.produto].value += item.valor_total;
      productTotals[item.produto].quantity += item.quantidade;
      productTotals[item.produto].establishments.add(item.estabelecimento);
    });

    return Object.entries(productTotals)
      .map(([name, data]) => ({
        name,
        value: data.value,
        quantity: data.quantity,
        establishments: data.establishments.size,
        avgPrice: data.value / data.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredItems]);

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

  // Product-specific statistics for products view
  const productStats = useMemo(() => {
    if (filteredItems.length === 0) return [];

    const productTotals: Record<string, { value: number; quantity: number; establishments: Set<string> }> = {};
    let totalGasto = 0;
    let maxGastoProduct = { name: '', value: 0 };
    let maxPriceProduct = { name: '', price: 0 };

    filteredItems.forEach(item => {
      totalGasto += item.valor_total;

      if (!productTotals[item.produto]) {
        productTotals[item.produto] = { value: 0, quantity: 0, establishments: new Set() };
      }
      
      productTotals[item.produto].value += item.valor_total;
      productTotals[item.produto].quantity += item.quantidade;
      productTotals[item.produto].establishments.add(item.estabelecimento);

      // Encontrar produto com maior gasto total
      if (productTotals[item.produto].value > maxGastoProduct.value) {
        maxGastoProduct = { name: item.produto, value: productTotals[item.produto].value };
      }

      // Encontrar produto com maior preço médio
      const avgPrice = productTotals[item.produto].value / productTotals[item.produto].quantity;
      if (avgPrice > maxPriceProduct.price) {
        maxPriceProduct = { name: item.produto, price: avgPrice };
      }
    });

    const uniqueProducts = Object.keys(productTotals).length;
    const avgGastoPerProduct = uniqueProducts > 0 ? totalGasto / uniqueProducts : 0;

    // Calcular concentração de gastos (% do produto que mais gasta)
    const concentracao = totalGasto > 0 ? (maxGastoProduct.value / totalGasto) * 100 : 0;

    return [
      {
        title: 'Produtos Únicos',
        value: uniqueProducts.toString(),
        icon: 'inventory' as const,
        color: colors.primary,
        subtitle: 'diferentes'
      },
      {
        title: 'Concentração',
        value: `${concentracao.toFixed(1)}%`,
        icon: 'pie-chart' as const,
        color: colors.warning,
        subtitle: 'no top produto'
      },
      {
        title: 'Gasto Médio/Produto',
        value: `R$ ${avgGastoPerProduct.toFixed(2)}`,
        icon: 'trending-up' as const,
        color: colors.accent,
        subtitle: 'por categoria'
      },
      {
        title: 'Maior Impacto',
        value: maxGastoProduct.name.length > 10 ? 
          maxGastoProduct.name.substring(0, 10) + '...' : maxGastoProduct.name,
        icon: 'priority-high' as const,
        color: colors.error,
        subtitle: `R$ ${maxGastoProduct.value.toFixed(2)}`
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
        name: name.length > 10 ? name.substring(0, 10) + '...' : name, // Truncar nomes das categorias
        value,
        color: categoryColors[index % categoryColors.length],
        legendFontColor: colors.textSecondary,
        legendFontSize: 10,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Reduzindo para 5 categorias
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
      name.length > 15 ? name.substring(0, 15) + '...' : name // Aumentando limite para melhor legibilidade
    );
    const data = sortedEntries.map(([,value]) => parseFloat(value.toFixed(2)));

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => colors.secondary,
      }]
    };
  }, [filteredItems, colors]);

  // Top products chart data (new)
  const topProductsData = useMemo(() => {
    if (filteredItems.length === 0) return [];

    const productTotals: Record<string, number> = {};

    filteredItems.forEach(item => {
      productTotals[item.produto] = (productTotals[item.produto] || 0) + item.valor_total;
    });

    const productColors = [
      colors.accent,
      colors.primary,
      colors.secondary, 
      colors.warning,
      '#EC4899',
      '#10B981',
      '#F59E0B',
      '#8B5CF6'
    ];

    return Object.entries(productTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6) // Top 6 produtos para melhor visualização no gráfico de pizza
      .map(([name, value], index) => ({
        name: name.length > 12 ? name.substring(0, 12) + '...' : name,
        value,
        color: productColors[index % productColors.length],
        legendFontColor: colors.textSecondary,
        legendFontSize: 9,
        population: value // Para compatibilidade com PieChart
      }));
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
        
        {/* View Mode Tabs */}
        <View style={tw('flex-row mb-4')}>
          {[
            { key: 'overview', label: 'Visão Geral', icon: 'dashboard' },
            { key: 'products', label: 'Produtos', icon: 'shopping-cart' },
            { key: 'establishments', label: 'Locais', icon: 'store' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleViewModeChange(tab.key as any)}
              style={[
                tw('flex-1 flex-row items-center justify-center py-3 mx-1 rounded-lg'),
                {
                  backgroundColor: viewMode === tab.key ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: viewMode === tab.key ? colors.primary : colors.border
                }
              ]}
            >
              <MaterialIcons 
                name={tab.icon as any} 
                size={16} 
                color={viewMode === tab.key ? colors.onPrimary : colors.textSecondary}
                style={tw('mr-1')}
              />
              <Text style={[
                tw('text-xs font-medium'),
                { color: viewMode === tab.key ? colors.onPrimary : colors.textSecondary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Filter */}
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

        {/* Additional Filters for Product/Establishment views */}
        {viewMode === 'products' && (
          <>
            <Card variant="outlined" style={tw('mb-2')}>
              <View style={tw('p-2')}>
                <View style={tw('flex-row items-center')}>
                  <MaterialIcons name="search" size={20} color={colors.textSecondary} style={tw('mr-2')} />
                  <TextInput
                    placeholder="Buscar produto (ex: cerveja, arroz, leite...)"
                    placeholderTextColor={colors.textSecondary}
                    value={productSearch}
                    onChangeText={setProductSearch}
                    style={[
                      tw('flex-1 py-2 text-base'),
                      { color: colors.text }
                    ]}
                  />
                  {productSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setProductSearch('')}>
                      <MaterialIcons name="clear" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>

            {/* Quick search suggestions */}
            {productSearch.trim() === '' && uniqueProducts.length > 0 && (
              <Card variant="outlined" style={tw('mb-2')}>
                <View style={tw('p-3')}>
                  <Text style={[tw('text-sm font-medium mb-2'), { color: colors.textSecondary }]}>
                    Sugestões rápidas:
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tw('flex-row')}
                    style={tw('flex-row')}
                  >
                    {uniqueProducts.slice(0, 10).map((product, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setProductSearch(product)}
                        style={[
                          tw('px-3 py-1 rounded-full mr-2'),
                          { backgroundColor: colors.primaryContainer }
                        ]}
                      >
                        <Text style={[
                          tw('text-xs'),
                          { color: colors.onPrimaryContainer }
                        ]}>
                          {product}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Card>
            )}
          </>
        )}

        {(viewMode === 'products' || viewMode === 'establishments') && (
          <Card variant="outlined" style={tw('mb-2')}>
            <Picker
              selectedValue={selectedEstablishment}
              onValueChange={setSelectedEstablishment}
              style={{ height: 40, color: colors.text }}
            >
              <Picker.Item label="Todos os estabelecimentos" value="all" />
              {uniqueEstablishments.map(establishment => (
                <Picker.Item key={establishment} label={establishment} value={establishment} />
              ))}
            </Picker>
          </Card>
        )}
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
            <StatsGrid stats={viewMode === 'products' ? productStats : mainStats} columns={2} />
          </Animated.View>

          {/* View Mode Content */}
          {viewMode === 'overview' && (
            <>
              {/* Category Chart */}
              {categoryData && categoryData.length > 0 && (
                <Animated.View entering={FadeInDown.delay(300)}>
                  <ModernChart
                    title="Gastos por Categoria"
                    type="pie"
                    data={categoryData}
                    height={180}
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

              {/* Top Products Chart */}
              {topProductsData && topProductsData.length > 0 && (
                <Animated.View entering={FadeInDown.delay(500)}>
                  <ModernChart
                    title="Produtos que Mais Gastei"
                    type="pie"
                    data={topProductsData}
                    height={200}
                  />
                </Animated.View>
              )}
            </>
          )}

          {/* Products Analysis */}
          {viewMode === 'products' && (
            <Animated.View entering={FadeInDown.delay(300)}>
              <Card variant="elevated" style={tw('mx-4 mt-4 mb-4')}>
                <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
                  Análise de Produtos
                </Text>
                
                {productData.map((product, index) => (
                  <View key={product.name} style={[tw('mb-4 pb-4'), index < productData.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={tw('flex-row justify-between items-start mb-2')}>
                      <Text style={[tw('font-semibold text-base flex-1'), { color: colors.text }]}>
                        {product.name}
                      </Text>
                      <Text style={[tw('font-bold text-lg'), { color: colors.primary }]}>
                        R$ {product.value.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={tw('flex-row justify-between')}>
                      <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                        {product.quantity} unidades
                      </Text>
                      <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                        R$ {product.avgPrice.toFixed(2)}/un
                      </Text>
                      <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                        {product.establishments} local{product.establishments > 1 ? 'is' : ''}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {productData.length === 0 && (
                  <Text style={[tw('text-center py-8'), { color: colors.textSecondary }]}>
                    Nenhum produto encontrado
                  </Text>
                )}
              </Card>
            </Animated.View>
          )}

          {/* Establishments Analysis */}
          {viewMode === 'establishments' && storeData.labels && storeData.labels.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)}>
              <ModernChart
                title="Análise Detalhada por Estabelecimento"
                type="bar"
                data={storeData}
                height={180}
              />
            </Animated.View>
          )}

          {/* Insights */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <Card variant="elevated" style={tw('mx-4 mt-4 mb-8')}>
              <Text style={[tw('text-xl font-semibold mb-3'), { color: colors.text }]}>
                Insights
              </Text>
              
              {viewMode === 'overview' && (
                <>
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

                  {topProductsData && topProductsData.length > 0 && (
                    <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                      • Produto que mais gasta: {topProductsData[0]?.name} (R$ {topProductsData[0]?.value.toFixed(2)})
                    </Text>
                  )}

                  <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                    • Total de produtos únicos: {uniqueProducts.length}
                  </Text>
                </>
              )}

              {viewMode === 'products' && productData.length > 0 && (
                <>
                  <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                    • Produto com maior gasto: {productData[0]?.name} (R$ {productData[0]?.value.toFixed(2)})
                  </Text>
                  <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                    • Produto mais caro: {productData.reduce((max, p) => p.avgPrice > max.avgPrice ? p : max, productData[0])?.name} (R$ {productData.reduce((max, p) => p.avgPrice > max.avgPrice ? p : max, productData[0])?.avgPrice.toFixed(2)}/un)
                  </Text>
                  <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                    • Total de produtos únicos: {uniqueProducts.length}
                  </Text>
                  {productSearch.trim() !== '' && (
                    <>
                      <Text style={[tw('text-sm mb-2 leading-5 font-semibold'), { color: colors.primary }]}>
                        📋 Pesquisa: "{productSearch}"
                      </Text>
                      {filteredItems.length > 0 ? (
                        <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.accent }]}>
                          • Total gasto: R$ {filteredItems.reduce((sum, item) => sum + item.valor_total, 0).toFixed(2)}
                        </Text>
                      ) : (
                        <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.error }]}>
                          • Nenhum produto encontrado
                        </Text>
                      )}
                    </>
                  )}
                </>
              )}

              {viewMode === 'establishments' && (
                <>
                  {storeData.labels.length > 0 && (
                    <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                      • Estabelecimento com maior gasto: {storeData.labels[0]}
                    </Text>
                  )}
                  <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.textSecondary }]}>
                    • Total de estabelecimentos: {uniqueEstablishments.length}
                  </Text>
                  {selectedEstablishment !== 'all' && (
                    <Text style={[tw('text-sm mb-2 leading-5'), { color: colors.primary }]}>
                      • Filtrado por: {selectedEstablishment}
                    </Text>
                  )}
                </>
              )}

              {filteredItems.length < items.length && (
                <Text style={[tw('text-sm mt-2 font-semibold'), { color: colors.accent }]}>
                  • Mostrando {filteredItems.length} de {items.length} compras
                </Text>
              )}
            </Card>
          </Animated.View>
        </>
      )}
    </ScrollView>
  );
}
