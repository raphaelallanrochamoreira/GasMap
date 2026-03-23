import { FuelType } from '../types';

export const FUEL_LABELS: Record<FuelType, string> = {
  gasolina: 'Gasolina',
  gasolina_aditivada: 'Gasolina Aditivada',
  etanol: 'Etanol',
  diesel: 'Diesel',
  diesel_s10: 'Diesel S-10',
  gnv: 'GNV',
};

export const FUEL_SHORT: Record<FuelType, string> = {
  gasolina: 'GAS',
  gasolina_aditivada: 'ADD',
  etanol: 'ETH',
  diesel: 'DSL',
  diesel_s10: 'S10',
  gnv: 'GNV',
};

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(3).replace('.', ',')}`;
}

export function priceColor(price: number, avg: number): string {
  const diff = (price - avg) / avg;
  if (diff <= -0.03) return '#22C55E';
  if (diff >= 0.03) return '#EF4444';
  return '#F59E0B';
}

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

export const BRAND_COLORS: Record<string, string> = {
  Ipiranga: '#F97316',
  Shell: '#FBBF24',
  Petrobras: '#22C55E',
  Raízen: '#EAB308',
  Bandeirante: '#A855F7',
  Ale: '#3B82F6',
  Outro: '#6B7280',
};

export const ALL_FUELS: FuelType[] = [
  'gasolina',
  'gasolina_aditivada',
  'etanol',
  'diesel',
  'diesel_s10',
  'gnv',
];
