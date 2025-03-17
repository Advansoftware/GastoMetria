import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useStorage } from "../../hooks/useStorage";
import { router } from "expo-router";

export default function SettingsScreen() {
  const { clearStorage } = useStorage();

  const handleClearStorage = () => {
    Alert.alert(
      "Limpar Dados",
      "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            await clearStorage();
            // Usar navigate ao invés de replace para forçar uma nova renderização
            router.navigate("/(tabs)/");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <TouchableOpacity style={styles.clearButton} onPress={handleClearStorage}>
        <Text style={styles.clearButtonText}>Limpar Todos os Dados</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: "#dc3545",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
