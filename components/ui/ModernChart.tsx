import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { tw } from '@/utils/tailwind';
import { usePlatformCapabilities } from '@/hooks/usePlatform';
import { MaterialIcons } from '@expo/vector-icons';

// Função para obter dimensões de forma segura
const getScreenWidth = () => {
  try {
    const { width } = Dimensions.get('window');
    return width && width > 0 ? width : 350;
  } catch (error) {
    console.warn('Erro ao obter dimensões da tela:', error);
    return 350;
  }
};

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface PieChartDataItem {
  name: string;
  population?: number;
  value?: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

interface ModernChartProps {
  title?: string;
  type: 'line' | 'bar' | 'pie';
  data: ChartData | PieChartDataItem[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  showLegend?: boolean;
  colors?: 'light' | 'dark';
}

export function ModernChart({ 
  title, 
  type, 
  data, 
  height = 220,
  showGrid = true,
  animated = true,
  showLegend = true,
  colors: themeOverride 
}: ModernChartProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[themeOverride ?? effectiveTheme];
  const { isWeb } = usePlatformCapabilities();

  // IMPORTANTE: Todos os hooks devem ser chamados antes de qualquer renderização condicional
  const [screenWidth, setScreenWidth] = useState(getScreenWidth());
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(getScreenWidth());
    };
    updateDimensions();
  }, []);

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <View style={[
        tw('p-4 rounded-lg items-center justify-center'),
        { backgroundColor: colors.surface, minHeight: height }
      ]}>
        <MaterialIcons name="bar-chart" size={48} color={colors.textSecondary} />
        <Text style={[tw('text-center mt-2'), { color: colors.textSecondary }]}>
          Nenhum dado disponível
        </Text>
      </View>
    );
  }

  // Para web, mostrar uma representação simples
  if (isWeb) {
    return (
      <View style={[
        tw('p-4 rounded-lg mx-4 my-2'),
        { backgroundColor: colors.surface }
      ]}>
        {title && (
          <Text style={[tw('text-lg font-semibold mb-4'), { color: colors.text }]}>
            {title}
          </Text>
        )}
        <Text style={[tw('text-center'), { color: colors.textSecondary }]}>
          Gráfico disponível na versão mobile
        </Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  // Calcular largura do gráfico baseado no número de itens para gráficos de barras
  const getChartWidth = (data: any) => {
    if (type === 'bar' && data?.labels?.length) {
      // Para gráficos de barras, calcular largura baseada no comprimento dos labels
      const labels = data.labels as string[];
      const averageLabelLength = labels.reduce((sum, label) => sum + label.length, 0) / labels.length;
      
      // Largura base por item baseada no comprimento médio dos labels
      const baseItemWidth = Math.max(80, averageLabelLength * 8); // 8px por caractere
      const itemWidth = baseItemWidth + 40; // Espaçamento extra entre barras
      
      const minWidth = Math.max(350, screenWidth - 32);
      const calculatedWidth = Math.max(minWidth, data.labels.length * itemWidth);
      
      return Math.min(calculatedWidth, screenWidth * 4); // Permitindo até 4x a largura da tela
    }
    return Math.max(320, Math.min(screenWidth - 32, 400));
  };

  const renderMobileChart = () => {
    // Validação de dados
    if (type === 'pie') {
      const pieData = data as PieChartDataItem[];
      if (!pieData || pieData.length === 0) {
        return (
          <View style={[tw("py-8 items-center justify-center"), { height }]}>
            <Text style={[tw("text-center"), { color: colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
          </View>
        );
      }
      
      // Normalizar dados do pie chart - garantir que temos 'population'
      const normalizedPieData = pieData.map(item => ({
        ...item,
        population: item.population || item.value || 0,
        legendFontSize: 10, // Reduzindo tamanho da fonte da legenda
        legendFontColor: colors.textSecondary
      }));
      
      if (normalizedPieData.every(item => item.population === 0)) {
        return (
          <View style={[tw("py-8 items-center justify-center"), { height }]}>
            <Text style={[tw("text-center"), { color: colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
          </View>
        );
      }
    } else {
      const chartData = data as ChartData;
      if (!chartData?.labels?.length || !chartData?.datasets?.[0]?.data?.length) {
        return (
          <View style={[tw("py-8 items-center justify-center"), { height }]}>
            <Text style={[tw("text-center"), { color: colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
          </View>
        );
      }
    }

    if (chartError) {
      return (
        <View style={[tw("py-8 items-center justify-center"), { height }]}>
          <Text style={[tw("text-center"), { color: colors.error }]}>
            Erro ao carregar gráfico
          </Text>
          <Text style={[tw("text-center text-xs mt-2"), { color: colors.textSecondary }]}>
            {chartError}
          </Text>
        </View>
      );
    }

    try {
      // Importação dinâmica dos gráficos apenas no mobile
      const { LineChart, BarChart, PieChart } = require('react-native-chart-kit');
      
      switch (type) {
        case 'line':
          const lineChartWidth = getChartWidth(data);
          return React.createElement(LineChart, {
            data: data as ChartData,
            width: lineChartWidth,
            height,
            chartConfig,
            bezier: true,
            style: { borderRadius: 16 },
            withDots: true,
            withShadow: false,
            withInnerLines: showGrid,
            withOuterLines: showGrid,
          });
        
        case 'bar':
          const chartWidth = getChartWidth(data);
          const chartData = data as ChartData;
          return React.createElement(BarChart, {
            data: chartData,
            width: chartWidth,
            height: Math.max(height, 200), // Garantir altura mínima para barras
            chartConfig: {
              ...chartConfig,
              // Ajustar tamanho da fonte das legendas baseado na largura
              labelColor: (opacity = 1) => colors.textSecondary,
              // Melhorar espaçamento e legibilidade
              decimalPlaces: 0,
            },
            style: { borderRadius: 16 },
            showValuesOnTopOfBars: true,
            withInnerLines: showGrid,
            fromZero: true,
            // Manter labels horizontais (sem rotação)
            verticalLabelRotation: 0,
            formatYLabel: (value: string) => `R$ ${parseFloat(value).toFixed(0)}`,
            // Aumentar padding para evitar corte dos labels
            contentInset: { top: 20, bottom: 30, left: 15, right: 15 },
          });
        
        case 'pie':
          const pieData = data as PieChartDataItem[];
          const normalizedPieData = pieData.map((item, index) => ({
            ...item,
            population: item.population || item.value || 0,
            legendFontSize: 9,
            legendFontColor: colors.textSecondary,
            name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name // Truncar nomes longos
          })).slice(0, 6); // Limitar a 6 itens para evitar sobrepor legendas
          
          const pieChartWidth = getChartWidth(data);
          return React.createElement(PieChart, {
            data: normalizedPieData,
            width: pieChartWidth,
            height: Math.min(height, 200), // Limitar altura do gráfico de pizza
            chartConfig,
            accessor: 'population',
            backgroundColor: 'transparent',
            paddingLeft: '10',
            center: [10, 0],
            hasLegend: true,
            style: { borderRadius: 16 },
          });
        
        default:
          return (
            <View style={[tw("py-8 items-center justify-center"), { height }]}>
              <Text style={[tw("text-center"), { color: colors.textSecondary }]}>
                Tipo de gráfico não suportado
              </Text>
            </View>
          );
      }
    } catch (error) {
      console.error('Erro ao renderizar gráfico:', error);
      setChartError(error instanceof Error ? error.message : 'Erro desconhecido');
      return (
        <View style={[tw("py-8 items-center justify-center"), { height }]}>
          <Text style={[tw("text-center"), { color: colors.error }]}>
            Erro ao carregar gráfico
          </Text>
        </View>
      );
    }
  };

  // Determinar se precisa de scroll horizontal
  const needsHorizontalScroll = () => {
    if (type === 'bar' && !Array.isArray(data)) {
      const chartData = data as ChartData;
      return chartData?.labels?.length > 2; // Se tem mais de 2 itens, ativar scroll
    }
    return false;
  };

  return (
    <View style={[tw("rounded-2xl p-3 mx-4 my-2 shadow-lg"), { backgroundColor: colors.surface }]}>
      {title && (
        <Text style={[tw("text-lg font-semibold mb-3 text-center"), { color: colors.text }]}>
          {title}
        </Text>
      )}
      {needsHorizontalScroll() ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw("items-center")}
          style={tw("overflow-hidden")}
        >
          {renderMobileChart()}
        </ScrollView>
      ) : (
        <View style={tw("items-center overflow-hidden")}>
          {renderMobileChart()}
        </View>
      )}
    </View>
  );
}