import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card } from './Card';
import { tw } from '@/utils/tailwind';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color 
}: StatCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTrendBgColor = () => {
    switch (trend) {
      case 'up':
        return colors.successContainer;
      case 'down':
        return colors.errorContainer;
      default:
        return colors.surfaceVariant;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  return (
    <Card variant="elevated" style={{ backgroundColor: colors.surfaceContainer, minHeight: 100 }}>
      <View style={tw("flex-row justify-between items-start mb-2")}>
        <View style={tw("flex-row items-center flex-1 gap-2")}>
          <Text style={[tw("text-sm font-medium uppercase tracking-wide"), { color: colors.textSecondary }]}>
            {title}
          </Text>
          {icon && (
            <MaterialIcons 
              name={icon} 
              size={20} 
              color={color || colors.primary} 
            />
          )}
        </View>
        
        {trend && trendValue && (
          <View style={[
            tw("flex-row items-center px-2 py-1 rounded-full"),
            { backgroundColor: getTrendBgColor() }
          ]}>
            <MaterialIcons 
              name={getTrendIcon()} 
              size={16} 
              color={getTrendColor()}
            />
            <Text style={[tw("text-xs font-semibold ml-1"), { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>

      <Text style={[tw("text-3xl font-bold mb-1"), { color: colors.onSurface }]}>
        {value}
      </Text>

      {subtitle && (
        <Text style={[tw("text-sm"), { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3;
}

export function StatsGrid({ stats, columns = 2 }: StatsGridProps) {
  const renderStats = () => {
    const rows = [];
    for (let i = 0; i < stats.length; i += columns) {
      const rowStats = stats.slice(i, i + columns);
      rows.push(
        <View key={i} style={tw("flex-row gap-2 mb-2")}>
          {rowStats.map((stat, index) => (
            <View 
              key={index} 
              style={tw("flex-1")}
            >
              <StatCard {...stat} />
            </View>
          ))}
          {/* Fill empty spaces if needed */}
          {rowStats.length < columns && 
            Array.from({ length: columns - rowStats.length }).map((_, emptyIndex) => (
              <View key={`empty-${emptyIndex}`} style={tw("flex-1")} />
            ))
          }
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={tw("gap-2")}>
      {renderStats()}
    </View>
  );
}
