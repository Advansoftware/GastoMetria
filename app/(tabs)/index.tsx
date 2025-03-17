import React, { useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Select, MenuItem } from "@/components/ui/select";
import { useStorage } from '../hooks/useStorage';

const HomeScreen = () => {
  const [gastos, setGastos] = useState<any[]>([]);
  const [resumo, setResumo] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { groupedItems, loadItems } = useStorage();

  const loadGastos = async () => {
    const storedData = await AsyncStorage.getItem("gastos");
    if (storedData) {
      const gastosParse = JSON.parse(storedData);
      const gastosFiltrados = gastosParse.filter((gasto: any) => {
        const gastoDate = new Date(gasto.data);
        return (
          gastoDate.getMonth() === selectedMonth &&
          gastoDate.getFullYear() === selectedYear
        );
      });
      setGastos(gastosFiltrados);
      organizarResumo(gastosFiltrados);
    }
  };

  const organizarResumo = (gastos: any[]) => {
    const resumoTemp: any = {};

    gastos.forEach((gasto) => {
      if (!resumoTemp[gasto.estabelecimento]) {
        resumoTemp[gasto.estabelecimento] = { total: 0, categorias: {} };
      }

      gasto.itens.forEach((item: any) => {
        resumoTemp[gasto.estabelecimento].total += item.preco;

        if (!resumoTemp[gasto.estabelecimento].categorias[item.categoria]) {
          resumoTemp[gasto.estabelecimento].categorias[item.categoria] = {
            total: 0,
            produtos: {},
          };
        }

        resumoTemp[gasto.estabelecimento].categorias[item.categoria].total +=
          item.preco;

        if (
          !resumoTemp[gasto.estabelecimento].categorias[item.categoria]
            .produtos[item.produto]
        ) {
          resumoTemp[gasto.estabelecimento].categorias[item.categoria].produtos[
            item.produto
          ] = 0;
        }

        resumoTemp[gasto.estabelecimento].categorias[item.categoria].produtos[
          item.produto
        ] += item.preco;
      });
    });

    setResumo(resumoTemp);
  };

  useEffect(() => {
    loadGastos();
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [])
  );

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const anos = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <View style={styles.selectWrapper}>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              label="Mês"
            >
              {meses.map((mes, index) => (
                <MenuItem key={index} label={mes} value={index} />
              ))}
            </Select>
          </View>
          
          <View style={styles.selectWrapper}>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              label="Ano"
            >
              {anos.map((ano) => (
                <MenuItem key={ano} label={String(ano)} value={ano} />
              ))}
            </Select>
          </View>
        </View>
      </View>

      <FlatList
        data={Object.entries(groupedItems)}
        keyExtractor={([estabelecimento]) => estabelecimento}
        renderItem={({ item: [estabelecimento, dados] }) => (
          <TouchableOpacity 
            style={styles.estabelecimentoCard}
            onPress={() => {
              router.push(`/estabelecimento/${estabelecimento}`);
            }}
          >
            <Text style={styles.estabelecimentoNome}>{estabelecimento}</Text>
            <Text style={styles.estabelecimentoData}>
              {new Date(dados.data).toLocaleDateString()}
            </Text>
            <Text style={styles.estabelecimentoTotal}>
              Total: R$ {dados.valor_total.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 8,
  },
  selectWrapper: {
    flex: 1,
  },
  gastoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  estabelecimento: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 8,
  },
  categoriaContainer: {
    marginLeft: 16,
    marginTop: 4,
  },
  categoria: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  produto: {
    fontSize: 14,
    color: "#666",
    marginLeft: 16,
  },
  quantidade: {
    fontSize: 14,
    color: "#666",
    marginLeft: 16,
  },
  detalhes: {
    fontSize: 14,
    color: "#666",
    marginLeft: 16,
  },
  ocorrencia: {
    fontSize: 14,
    color: "#666",
    marginLeft: 16,
  },
  estabelecimentoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  estabelecimentoNome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  estabelecimentoData: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  estabelecimentoTotal: {
    fontSize: 16,
    color: "#007AFF",
  },
});

export default HomeScreen;
