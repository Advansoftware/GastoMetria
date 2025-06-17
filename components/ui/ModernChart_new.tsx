import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

interface PieChartDataItem {
  name: string;
  population: number;
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
  colors: colorScheme 
}: ModernChartProps) {
  const colors = Colors[colorScheme ?? 'light'];
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
        tw('p-4 rounded-lg'),
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

  const chartWidth = Math.max(300, Math.min(screenWidth - 32, 600));

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
          return React.createElement(LineChart, {
            data: data as ChartData,
            width: chartWidth,
            height,
            chartConfig,
            bezier: true,
            style: { marginVertical: 8, borderRadius: 16 },
            withDots: true,
            withShadow: false,
            withInnerLines: showGrid,
            withOuterLines: showGrid,
          });
        
        case 'bar':
          return React.createElement(BarChart, {
            data: data as ChartData,
            width: chartWidth,
            height,
            chartConfig,
            style: { marginVertical: 8, borderRadius: 16 },
            showValuesOnTopOfBars: true,
            withInnerLines: showGrid,
          });
        
        case 'pie':
          return React.createElement(PieChart, {
            data: data as PieChartDataItem[],
            width: chartWidth,
            height,
            chartConfig,
            accessor: 'population',
            backgroundColor: 'transparent',
            paddingLeft: '15',
            style: { marginVertical: 8, borderRadius: 16 },
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

  return (
    <View style={[tw("rounded-2xl p-4 my-2 shadow-lg"), { backgroundColor: colors.surface }]}>
      {title && (
        <Text style={[tw("text-lg font-semibold mb-4 text-center"), { color: colors.text }]}>
          {title}
        </Text>
      )}
      {renderMobileChart()}
    </View>
  );
}
