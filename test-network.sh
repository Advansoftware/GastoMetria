#!/bin/bash

echo "=== TESTE DE CONECTIVIDADE DE REDE ==="
echo ""

# Verificar o IP local
echo "🌐 IP local do computador:"
ip route get 1 | awk '{print $7}' | head -1
echo ""

# Verificar dispositivos na rede
echo "🔍 Escaneando dispositivos na rede local..."
nmap -sn 192.168.3.0/24 | grep -E "Nmap scan report|MAC Address" | head -20
echo ""

# Tentar conectar na porta 3000 dos IPs encontrados
echo "🔌 Testando conexão na porta 3000..."
for ip in $(nmap -sn 192.168.3.0/24 | grep "Nmap scan report" | awk '{print $5}'); do
    echo "Testando $ip:3000..."
    timeout 2 nc -z $ip 3000 && echo "✅ $ip:3000 ABERTA" || echo "❌ $ip:3000 fechada"
done

echo ""
echo "📱 Se o servidor estiver rodando no celular, você deve ver uma porta 3000 ABERTA acima"
echo "🌐 Acesse no navegador: http://IP_ENCONTRADO:3000"
