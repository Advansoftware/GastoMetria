import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { tw } from '@/utils/tailwind';
import { usePlatformCapabilities } from '@/hooks/usePlatform';

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
  value: number;
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
}

export function ModernChart({ 
  title, 
  type, 
  data, 
  height = 220,
  showGrid = true,
  animated = true 
}: ModernChartProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];
  const { isWeb } = usePlatformCapabilities();

  // Para ambiente web, vamos renderizar uma visualização mais rica
  if (isWeb) {
    const renderWebChart = () => {
      if (type === 'pie') {
        const pieData = data as PieChartDataItem[];
        if (!pieData || pieData.length === 0) {
          return (
            <Text style={[tw("text-center"), { color: colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
          );
        }

        const total = pieData.reduce((sum, item) => sum + item.value, 0);
        
        return (
          <View style={tw("space-y-3")}>
            {pieData.slice(0, 5).map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <View key={index} style={tw("flex-row items-center justify-between")}>
                  <View style={tw("flex-row items-center flex-1")}>
                    <View 
                      style={[
                        tw("w-4 h-4 rounded mr-3"), 
                        { backgroundColor: item.color || colors.primary }
                      ]} 
                    />
                    <Text 
                      style={[tw("flex-1 text-sm"), { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <View style={tw("ml-2")}>
                    <Text style={[tw("text-sm font-semibold"), { color: colors.text }]}>
                      R$ {item.value.toFixed(2)}
                    </Text>
                    <Text style={[tw("text-xs text-right"), { color: colors.textSecondary }]}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      } else {
        const chartData = data as ChartData;
        if (!chartData?.labels?.length || !chartData?.datasets?.[0]?.data?.length) {
          return (
            <Text style={[tw("text-center"), { color: colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
          );
        }

        const labels = chartData.labels;
        const values = chartData.datasets[0].data;
        const maxValue = Math.max(...values);

        return (
          <View style={tw("space-y-2")}>
            {labels.slice(-8).map((label, index) => {
              const value = values[values.length - 8 + index] || 0;
              const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <View key={index} style={tw("mb-3")}>
                  <View style={tw("flex-row justify-between items-center mb-1")}>
                    <Text style={[tw("text-sm"), { color: colors.text }]}>
                      {label}
                    </Text>
                    <Text style={[tw("text-sm font-semibold"), { color: colors.text }]}>
                      R$ {value.toFixed(2)}
                    </Text>
                  </View>
                  <View 
                    style={[
                      tw("h-2 rounded-full"), 
                      { backgroundColor: colors.border }
                    ]}
                  >
                    <View 
                      style={[
                        tw("h-2 rounded-full"),
                        { 
                          backgroundColor: colors.primary,
                          width: `${barWidth}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
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
        <View style={[tw("py-4"), { minHeight: height * 0.8 }]}>
          {renderWebChart()}
        </View>
        <Text style={[tw("text-center text-xs mt-3"), { color: colors.textSecondary }]}>
          💡 Visualização otimizada para web • Gráficos interativos disponíveis no mobile
        </Text>
      </View>
    );
  }

  // Para mobile, usar react-native-chart-kit
  const [screenWidth, setScreenWidth] = useState(getScreenWidth());
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(getScreenWidth());
    };
    updateDimensions();
  }, []);

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
            accessor: 'value',
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


