import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ModernButton } from '@/components/ui/ModernButton';
import { MaterialIcons } from '@expo/vector-icons';
import { tw } from '@/utils/tailwind';
import { useStorage } from '@/app/hooks/useStorage';
import { PurchaseItem } from '@/app/types/storage';

interface WebDemoDataProps {
  onAddDemoData: () => void;
}

export const WebDemoData: React.FC<WebDemoDataProps> = ({ onAddDemoData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { saveItem } = useStorage();

  const demoData: PurchaseItem[] = [
    {
      produto: 'Arroz Tipo 1 5kg',
      categoria: 'Alimentação',
      quantidade: 1,
      valor_unitario: 25.90,
      valor_total: 25.90,
      estabelecimento: 'Supermercado Extra',
      data: '15/06/2025',
      chaveNota: 'demo_001'
    },
    {
      produto: 'Feijão Preto 1kg',
      categoria: 'Alimentação', 
      quantidade: 2,
      valor_unitario: 8.50,
      valor_total: 17.00,
      estabelecimento: 'Supermercado Extra',
      data: '15/06/2025',
      chaveNota: 'demo_001'
    },
    {
      produto: 'Sabão em Pó 2kg',
      categoria: 'Limpeza',
      quantidade: 1,
      valor_unitario: 12.90,
      valor_total: 12.90,
      estabelecimento: 'Drogaria São Paulo',
      data: '14/06/2025',
      chaveNota: 'demo_002'
    },
    {
      produto: 'Shampoo Anticaspa',
      categoria: 'Higiene',
      quantidade: 1,
      valor_unitario: 15.99,
      valor_total: 15.99,
      estabelecimento: 'Farmácia Popular',
      data: '13/06/2025',
      chaveNota: 'demo_003'
    },
    {
      produto: 'Café Torrado 500g',
      categoria: 'Alimentação',
      quantidade: 3,
      valor_unitario: 9.99,
      valor_total: 29.97,
      estabelecimento: 'Mercado Local',
      data: '12/06/2025',
      chaveNota: 'demo_004'
    }
  ];

  const handleAddDemoData = async () => {
    setIsLoading(true);
    try {
      for (const item of demoData) {
        await saveItem(item);
      }
      Alert.alert(
        'Dados de Demonstração Adicionados!',
        'Foram adicionados dados de exemplo para você explorar as funcionalidades do app.',
        [{ text: 'OK' }]
      );
      onAddDemoData();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar os dados de demonstração.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" style={tw('m-4')}>
      <View style={tw('p-4')}>
        <View style={tw('flex-row items-center mb-4')}>
          <MaterialIcons name="web" size={24} color="#3b82f6" />
          <Text style={tw('text-lg font-bold ml-2')}>
            Versão Web - Demonstração
          </Text>
        </View>
        
        <Text style={tw('text-gray-600 mb-4 leading-5')}>
          Na versão web, você pode visualizar todas as funcionalidades do GastoMetria. 
          Para usar a câmera e escanear QR codes, instale o app no seu celular.
        </Text>

        <View style={tw('bg-blue-50 p-3 rounded-lg mb-4')}>
          <Text style={tw('text-blue-800 font-medium mb-2')}>
            Funcionalidades Disponíveis na Web:
          </Text>
          <Text style={tw('text-blue-700 text-sm')}>
            • Visualização de gastos e relatórios{'\n'}
            • Gráficos e estatísticas{'\n'}
            • Navegação entre estabelecimentos{'\n'}
            • Configurações do app
          </Text>
        </View>

        <View style={tw('bg-green-50 p-3 rounded-lg mb-4')}>
          <Text style={tw('text-green-800 font-medium mb-2')}>
            Funcionalidades Completas no Celular:
          </Text>
          <Text style={tw('text-green-700 text-sm')}>
            • Escaneamento de QR codes{'\n'}
            • Processamento automático com IA{'\n'}
            • Câmera e OCR{'\n'}
            • Todas as funcionalidades da web
          </Text>
        </View>

        <ModernButton
          variant="primary"
          size="lg"
          leftIcon="add-circle"
          onPress={handleAddDemoData}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Carregando...' : 'Adicionar Dados de Demonstração'}
        </ModernButton>
      </View>
    </Card>
  );
};
