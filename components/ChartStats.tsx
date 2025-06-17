import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Select, MenuItem } from '@/components/ui/select';
import { PurchaseItem, GroupedItems } from '@/app/types/storage';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

type StatsType = 'produtos' | 'estabelecimentos' | 'categorias' | 'datas';

interface ChartStatsProps {
  items: PurchaseItem[];
  groupedItems: GroupedItems;
}

const ChartStats: React.FC<ChartStatsProps> = ({ items, groupedItems }) => {
  const [statsType, setStatsType] = React.useState<StatsType>('estabelecimentos');
  const [data, setData] = React.useState<Array<{ label: string; value: number }>>([]);
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  // Memoizar os items e groupedItems para evitar recriações desnecessárias
  const memoizedItems = React.useMemo(() => items, [items]);
  const memoizedGroupedItems = React.useMemo(() => groupedItems, [groupedItems]);

  const processData = React.useCallback(() => {
    if (!memoizedItems?.length) {
      setData([]);
      return;
    }

    let aggregateData: Record<string, number> = {};

    switch (statsType) {
      case 'estabelecimentos':
        if (memoizedGroupedItems) {
          Object.entries(memoizedGroupedItems).forEach(([estabelecimento, dados]) => {
            aggregateData[estabelecimento] = dados.valor_total;
          });
        }
        break;
      
      case 'datas':
        memoizedItems.reduce((acc, item) => {
          const date = new Date(item.data).toLocaleDateString();
          acc[date] = (acc[date] || 0) + item.valor_total;
          return acc;
        }, aggregateData);
        break;
      
      default:
        memoizedItems.reduce((acc, item) => {
          const key = statsType === 'produtos' ? item.produto : item.categoria;
          acc[key] = (acc[key] || 0) + item.valor_total;
          return acc;
        }, aggregateData);
    }

    const sortedData = Object.entries(aggregateData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([label, value]) => ({
        label: label.length > 20 ? `${label.substring(0, 20)}...` : label,
        value
      }));

    setData(sortedData);
  }, [memoizedItems, memoizedGroupedItems, statsType]);

  React.useEffect(() => {
    processData();
  }, [processData]);

  const maxValue = Math.max(...data.map(item => item.value), 0);

  const getBarColor = (index: number) => {
    const colorMap = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    return colorMap[index % colorMap.length];
  };

  const getStatsIcon = (type: StatsType) => {
    const iconMap = {
      estabelecimentos: 'store',
      produtos: 'shopping-cart',
      categorias: 'category',
      datas: 'date-range'
    } as const;
    return iconMap[type];
  };

  return (
    <View style={[tw('rounded-xl p-4 shadow-lg'), { backgroundColor: colors.surface }]}>
      {/* Header com seletor */}
      <View style={tw('mb-6')}>
        <View style={tw('flex-row items-center mb-4')}>
          <MaterialIcons 
            name={getStatsIcon(statsType)} 
            size={24} 
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={[tw('text-lg font-semibold'), { color: colors.text }]}>
            Estatísticas
          </Text>
        </View>
        
        <Select
          value={statsType}
          onChange={setStatsType}
          label="Tipo de Estatística"
        >
          <MenuItem label="Estabelecimentos" value="estabelecimentos" />
          <MenuItem label="Produtos" value="produtos" />
          <MenuItem label="Categorias" value="categorias" />
          <MenuItem label="Por Data" value="datas" />
        </Select>
      </View>

      {data.length > 0 ? (
        <Animated.View entering={FadeInUp}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View 
              style={[tw('flex-row items-end pt-5 pb-5 mt-4'), { minWidth: Dimensions.get('window').width - 32 }]}
            >
              {data.map((item, index) => (
                <Animated.View 
                  key={index} 
                  entering={FadeInDown.delay(index * 100)}
                  style={tw('items-center flex-1')}
                >
                  {/* Valor */}
                  <Text style={[tw('text-xs mb-1 font-medium'), { color: colors.textSecondary }]}>
                    R$ {item.value.toFixed(2)}
                  </Text>
                  
                  {/* Barra */}
                  <View style={tw('h-48 justify-end')}>
                    <View 
                      style={[
                        tw(`w-6 rounded-t-lg min-h-[4px] shadow-sm`),
                        { 
                          height: (item.value / maxValue) * 180,
                          backgroundColor: colors.primary
                        }
                      ]}
                    />
                  </View>
                  
                  {/* Label */}
                  <Text 
                    style={[tw('text-xs text-center mt-2 w-16'), { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </ScrollView>

          {/* Legenda resumida */}
          <View style={[tw('mt-4 pt-4 border-t'), { borderColor: colors.border }]}>
            <Text style={[tw('text-sm text-center'), { color: colors.textSecondary }]}>
              Top {data.length} {statsType.charAt(0).toUpperCase() + statsType.slice(1)} • 
              Total: R$ {data.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
            </Text>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown}>
          <View style={tw('py-12 items-center justify-center')}>
            <MaterialIcons 
              name="insert-chart" 
              size={64} 
              color={colors.textSecondary}
              style={{ marginBottom: 16 }}
            />
            <Text style={[tw('text-lg font-medium'), { color: colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
            <Text style={[tw('text-sm mt-2 text-center'), { color: colors.textSecondary }]}>
              Escaneie algumas notas fiscais para ver as estatísticas
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default ChartStats;