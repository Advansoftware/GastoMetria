import React, { useEffect, useState } from "react";
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

const HomeScreen = () => {
  const [gastos, setGastos] = useState<any[]>([]);
  const [resumo, setResumo] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const navigateToCamera = () => {
    try {
      router.push("/(tabs)/scan/");
    } catch (error) {
      console.error("Erro na navegação:", error);
    }
  };

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
        
        <Button color="primary" variant="contained" onPress={navigateToCamera}>
          Escanear Nota
        </Button>
      </View>

      <FlatList
        data={Object.keys(resumo)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.gastoCard}>
            <Text style={styles.estabelecimento}>{item}</Text>
            <Text style={styles.total}>
              Total: R$ {resumo[item].total.toFixed(2)}
            </Text>
            {Object.keys(resumo[item].categorias).map((categoria) => (
              <View key={categoria} style={styles.categoriaContainer}>
                <Text style={styles.categoria}>
                  {categoria}: R${" "}
                  {resumo[item].categorias[categoria].total.toFixed(2)}
                </Text>
                {Object.keys(resumo[item].categorias[categoria].produtos).map(
                  (produto) => (
                    <Text key={produto} style={styles.produto}>
                      {produto}: R${" "}
                      {resumo[item].categorias[categoria].produtos[
                        produto
                      ].toFixed(2)}
                    </Text>
                  )
                )}
              </View>
            ))}
          </View>
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
  scanButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
});

export default HomeScreen;
