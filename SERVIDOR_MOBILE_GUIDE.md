# 🌐 Guia do Servidor Mobile - GastoMetria (Expo)

## 📱 Como acessar o dashboard do celular no computador

### **Situação Atual: Expo Development Build**
Você está usando Expo com development build. Neste ambiente, algumas limitações se aplicam para servidores HTTP nativos.

### **⚠️ REALIDADE DO EXPO**
O Expo tem limitações para criar servidores HTTP reais que aceitem conexões externas no modo development. Para servidor HTTP real funcionando:

## 🚀 **Para Servidor Real Funcionando Externamente**

### **Opção 1: Expo Development Build (Recomendado)**
```bash
cd /home/beeleads/git/GastoMetria

# Instalar EAS CLI se não tiver
npm install -g @expo/eas-cli
eas login

# Criar development build
eas build --platform android --profile development

# Após o build terminar, baixar e instalar o APK no celular
```

### **Opção 2: Expo Build Standalone**
```bash
# Build standalone (mais pesado mas funcional)
npx expo build:android --type=apk

# Aguardar o build terminar e baixar o APK
# Instalar no celular físico
```

### **Opção 3: Ejecting (Não recomendado)**
```bash
# Somente se necessário - perde benefícios do Expo
npx expo eject
```

---

## 🔧 **Testando no Modo Expo Atual**

### **Passo 1: Ativar o Servidor no App**
1. Abra o app GastoMetria no seu celular
2. Vá para a aba **"Servidor"** 
3. Ative o switch **"Servidor Web"**
4. O app mostrará:
   - ✅ Status: Ativo (Demonstração Expo)
   - 🌐 URL: `http://192.168.3.38:3000`
   - ⚠️ Aviso sobre limitações do Expo

### **Passo 2: Verificar o IP**
- Anote o IP mostrado no app (exemplo: `192.168.3.38`)
- Este é o IP real do seu celular na rede local

### **Passo 3: Testar Funcionalidades**
No modo Expo atual, você pode:
- ✅ Ver o IP do celular
- ✅ Testar a interface do servidor no app
- ✅ Verificar dados locais
- ❌ **NÃO pode** acessar externamente de outros dispositivos

---

## 📱 **Quando usar Development Build Real:**

### **Após instalar APK do development build:**

1. **No celular com APK instalado:**
   - Abra o GastoMetria (versão instalada)
   - Vá em "Servidor" → Ative o servidor
   - Anote o IP (ex: `192.168.3.38:3000`)

2. **No computador (mesma rede Wi-Fi):**
   - Abra qualquer navegador
   - Digite: `http://192.168.3.38:3000`
   - Você verá o dashboard completo do GastoMetria

### **O que você verá no dashboard real:**
- 💰 Estatísticas em tempo real (total gasto, itens, estabelecimentos)
- 📋 Lista das últimas compras com dados reais
- 🏪 Ranking de estabelecimentos baseado em dados reais
- 📊 Gráficos interativos
- 🔄 Atualização automática dos dados do celular

---

## 🛠️ **Comandos para Development Build**

### **EAS Build (Recomendado)**
```bash
cd /home/beeleads/git/GastoMetria

# Configurar projeto EAS se não foi feito
eas build:configure

# Build de desenvolvimento (permite debugging)
eas build --platform android --profile development

# Build de produção (para release)
eas build --platform android --profile production
```

### **Aguardar e Instalar**
1. O EAS irá fazer o build na nuvem
2. Você receberá um link para download
3. Baixe o APK no celular
4. Instale o APK (permitir instalação de fontes desconhecidas)
5. Execute o app instalado

---

## 🔍 **Por que o Expo limita servidores HTTP?**

### **Limitações de Segurança:**
- **Expo Go**: Não permite servidores HTTP nativos por segurança
- **Development Build**: Limitado para localhost/apps internos
- **Standalone Build**: Permite servidores HTTP reais

### **Alternativas para Development:**
- ✅ **EAS Development Build**: Funciona como app nativo
- ✅ **Standalone APK**: Funciona completamente
- ❌ **Expo Go**: Não suporta servidores HTTP

---

## 🚨 **Resolução de Problemas**

### **"Expo não permite servidor externo"**
- ✅ Fazer development build com EAS
- ✅ Usar standalone build
- ✅ Instalar APK no celular físico
- ❌ Não funciona no Expo Go

### **"Build demora muito"**
- ✅ Usar EAS (build na nuvem)
- ✅ Criar conta Expo gratuita
- ✅ Aguardar build terminar (5-15 min)

### **"Não consegue instalar APK"**
- ✅ Habilitar "Fontes desconhecidas" no Android
- ✅ Baixar APK diretamente no celular
- ✅ Verificar espaço de armazenamento

---

## 🎯 **Status Atual do Projeto**

- ✅ **Servidor Expo funcionando localmente**
- ✅ **Interface web completa criada**  
- ✅ **API endpoints simulados implementados**
- ✅ **QR Code para compartilhamento**
- ⏳ **Aguardando EAS build para servidor real**

**Próximo passo**: Executar `eas build --platform android --profile development` e instalar APK para servidor HTTP real funcionando externamente.
