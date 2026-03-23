<div align="center">

# ⛽ GasMap

**Mapa de postos de gasolina com preços de combustíveis**

[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://typescriptlang.org)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.3-764ABC?logo=redux)](https://redux-toolkit.js.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📱 Sobre

GasMap exibe postos de gasolina próximos em um mapa interativo com os preços dos combustíveis visíveis diretamente nos marcadores. Interface escura, filtros por combustível, ordenação por distância/preço/avaliação e detalhes completos de cada posto.

---

## 🚀 Rodar no Expo Snack (sem instalar nada)

1. Acesse **[snack.expo.dev](https://snack.expo.dev)**
2. Clique em **"Upload"** → faça upload do `.zip` deste repositório
3. Aguarde as dependências instalarem e clique em **▶ Run**

> O Snack usa automaticamente o `package.json` para instalar os pacotes corretos.

---

## 💻 Rodar localmente

### Pré-requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | 18+ |
| Expo CLI | `npm i -g expo-cli` |
| Expo Go (celular) | [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |

### Passos

```bash
# 1. Clone
git clone https://github.com/seu-usuario/gasmap.git
cd gasmap

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npx expo start

# 4. Escaneie o QR Code com o app Expo Go no celular
```

### Rodar em emulador

```bash
npx expo start --android   # Android Studio
npx expo start --ios       # Xcode (somente macOS)
```

---

## 🗺️ Chave do Google Maps (opcional para Snack)

O Snack usa o provider padrão da plataforma. Para produção com Google Maps:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Ative **Maps SDK for Android** e **Maps SDK for iOS**
3. Gere uma API Key e adicione ao `app.json`:

```json
"ios": {
  "config": { "googleMapsApiKey": "SUA_CHAVE_IOS" }
},
"android": {
  "config": { "googleMaps": { "apiKey": "SUA_CHAVE_ANDROID" } }
}
```

---

## 🏗️ Estrutura do projeto

```
gasmap/
├── App.tsx                      # Entry point
├── app.json                     # Configuração Expo
├── package.json                 # Dependências (Expo SDK 51)
└── src/
    ├── components/
    │   ├── AmenityChip.tsx      # Chip de comodidade
    │   ├── FilterBar.tsx        # Barra de filtros do mapa
    │   ├── FuelPriceRow.tsx     # Linha de preço de combustível
    │   ├── RatingStars.tsx      # Estrelas de avaliação
    │   ├── StationBottomSheet.tsx  # Sheet do posto selecionado
    │   └── StationMarker.tsx    # Marcador customizado no mapa
    ├── data/
    │   └── mockStations.ts      # Dados de exemplo (6 postos em SP)
    ├── navigation/
    │   ├── index.tsx            # Tab navigator raiz
    │   ├── MapStack.tsx         # Stack do mapa
    │   └── SettingsStack.tsx    # Stack de configurações
    ├── screens/
    │   ├── MapScreen.tsx        # Tela principal com mapa
    │   ├── StationDetailScreen.tsx  # Detalhes do posto
    │   ├── SettingsScreen.tsx   # Configurações
    │   ├── EditProfileScreen.tsx
    │   ├── FuelPreferencesScreen.tsx
    │   └── AboutScreen.tsx
    ├── store/
    │   ├── index.ts             # Redux store + hooks tipados
    │   └── slices/
    │       └── appSlice.ts      # Slice único (estações, filtros, usuário)
    ├── theme/
    │   └── index.ts             # Cores, espaçamento, sombras, bordas
    ├── types/
    │   └── index.ts             # Interfaces TypeScript
    └── utils/
        ├── fuel.ts              # Labels, cores e formatação de combustível
        └── geo.ts               # Cálculo de distância (Haversine)
```

---

## ✨ Funcionalidades

| Feature | Status |
|---|---|
| 🗺️ Mapa interativo com marcadores de preço | ✅ |
| ⛽ Filtro por tipo de combustível | ✅ |
| 🔃 Ordenar por distância / preço / avaliação | ✅ |
| 🚪 Filtro "apenas abertos" | ✅ |
| ❤️ Favoritar postos | ✅ |
| 📍 Localização do usuário (GPS) | ✅ |
| 📋 Detalhes: comodidades, avaliação, rota | ✅ |
| 👤 Perfil e combustível favorito | ✅ |
| 🌙 Tema escuro nativo | ✅ |
| 🔔 Push notifications | 🔜 |
| 🏷️ Reportar preço pela comunidade | 🔜 |
| 📊 Histórico de preços | 🔜 |

---

## 📦 Dependências principais

| Pacote | Versão | Uso |
|---|---|---|
| `expo` | ~51.0.28 | SDK base |
| `react-native` | 0.74.5 | Framework |
| `react-native-maps` | 1.14.0 | Mapas (compatível com Expo 51) |
| `expo-location` | ~17.0.1 | GPS / permissões |
| `@react-navigation/native` | ^6.1.18 | Navegação |
| `@reduxjs/toolkit` | ^2.3.0 | Estado global |
| `@expo/vector-icons` | ^14.0.2 | Ícones Ionicons |
| `react-native-gesture-handler` | ~2.16.1 | Gestos nativos |

> ⚠️ **Importante:** `react-native-maps@1.14.0` é a última versão compatível com **Expo SDK 51 / RN 0.74**. Versões `^1.18` requerem RN 0.76+.

---

## 🤝 Contribuindo

1. Fork → branch → commit (`feat:`, `fix:`, `docs:`) → PR
2. Rode `npx expo start` e teste no dispositivo antes de abrir o PR

---

## 📄 Licença

MIT © 2025 GasMap · Feito com ❤️ no Brasil 🇧🇷
