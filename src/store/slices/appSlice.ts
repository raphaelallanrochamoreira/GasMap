import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Station, MapFilters, FuelType } from '../../types';
import { MOCK_STATIONS } from '../../data/mockStations';

interface AppState {
  stations: Station[];
  selectedStationId: string | null;
  filters: MapFilters;
  userFavoriteFuel: FuelType;
  userName: string;
  userEmail: string;
}

const initialState: AppState = {
  stations: MOCK_STATIONS,
  selectedStationId: null,
  filters: {
    fuelType: null,
    maxDistanceKm: 5,
    onlyOpen: false,
    onlyFavorites: false,
    sortBy: 'distance',
  },
  userFavoriteFuel: 'gasolina',
  userName: 'Visitante',
  userEmail: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    selectStation(state, action: PayloadAction<string | null>) {
      state.selectedStationId = action.payload;
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const station = state.stations.find(s => s.id === action.payload);
      if (station) station.isFavorite = !station.isFavorite;
    },
    setFuelFilter(state, action: PayloadAction<FuelType | null>) {
      state.filters.fuelType = action.payload;
    },
    setOnlyOpen(state, action: PayloadAction<boolean>) {
      state.filters.onlyOpen = action.payload;
    },
    setOnlyFavorites(state, action: PayloadAction<boolean>) {
      state.filters.onlyFavorites = action.payload;
    },
    setSortBy(state, action: PayloadAction<MapFilters['sortBy']>) {
      state.filters.sortBy = action.payload;
    },
    setFavoriteFuel(state, action: PayloadAction<FuelType>) {
      state.userFavoriteFuel = action.payload;
    },
    updateProfile(state, action: PayloadAction<{ name: string; email: string }>) {
      state.userName = action.payload.name;
      state.userEmail = action.payload.email;
    },
    updateStationPrice(
      state,
      action: PayloadAction<{ stationId: string; fuelType: FuelType; price: number }>,
    ) {
      const station = state.stations.find(s => s.id === action.payload.stationId);
      if (!station) return;
      const existing = station.prices.find(p => p.type === action.payload.fuelType);
      if (existing) {
        existing.price = action.payload.price;
        existing.updatedAt = new Date().toISOString();
      } else {
        station.prices.push({
          type: action.payload.fuelType,
          price: action.payload.price,
          updatedAt: new Date().toISOString(),
        });
      }
    },
  },
});

export const {
  selectStation,
  toggleFavorite,
  setFuelFilter,
  setOnlyOpen,
  setOnlyFavorites,
  setSortBy,
  setFavoriteFuel,
  updateProfile,
  updateStationPrice,
} = appSlice.actions;

export default appSlice.reducer;
