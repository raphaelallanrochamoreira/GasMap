export type FuelType =
  | 'gasolina'
  | 'gasolina_aditivada'
  | 'etanol'
  | 'diesel'
  | 'diesel_s10'
  | 'gnv';

export interface FuelPrice {
  type: FuelType;
  price: number;
  updatedAt: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type Amenity = 'banheiro' | 'loja' | 'lavagem' | 'troca_oleo' | 'restaurante' | 'wifi';
export type StationBrand =
  | 'Ipiranga'
  | 'Shell'
  | 'Petrobras'
  | 'Raízen'
  | 'Bandeirante'
  | 'Ale'
  | 'Outro';

export interface Station {
  id: string;
  name: string;
  brand: StationBrand;
  address: string;
  city: string;
  state: string;
  coordinates: Coordinates;
  prices: FuelPrice[];
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  openHours: string;
  phone?: string;
  amenities: Amenity[];
  distanceKm?: number;
  isFavorite?: boolean;
}

export interface MapFilters {
  fuelType: FuelType | null;
  maxDistanceKm: number;
  onlyOpen: boolean;
  onlyFavorites: boolean;
  sortBy: 'distance' | 'price' | 'rating';
}

export interface UserProfile {
  name: string;
  email: string;
  favoriteFuel: FuelType;
  favoriteStationIds: string[];
}

export type RootTabParamList = {
  MapTab: undefined;
  SettingsTab: undefined;
};

export type MapStackParamList = {
  Map: undefined;
  StationDetail: { stationId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  FuelPreferences: undefined;
  About: undefined;
};
