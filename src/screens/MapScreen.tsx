import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { Colors, Spacing, Radius, Shadows } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { selectStation } from '../store/slices/appSlice';
import { haversineDistanceKm } from '../utils/geo';
import { StationBottomSheet } from '../components/StationBottomSheet';
import { FilterBar } from '../components/FilterBar';
import { Station } from '../types';
import { BRAND_COLORS, FUEL_SHORT } from '../utils/fuel';
import { DEFAULT_REGION } from '../data/mockStations';

// ─── Build Leaflet HTML ───────────────────────────────────────────────────────

function buildLeafletHTML(
  stations: Station[],
  userLat?: number,
  userLng?: number,
): string {
  const center = userLat
    ? `[${userLat}, ${userLng}]`
    : `[${DEFAULT_REGION.latitude}, ${DEFAULT_REGION.longitude}]`;

  const markersJS = stations
    .map(s => {
      const color = BRAND_COLORS[s.brand] ?? '#F97316';
      const topPrice = s.prices[0];
      const priceLabel = topPrice
        ? `${FUEL_SHORT[topPrice.type]} R$${topPrice.price.toFixed(2)}`
        : s.brand.slice(0, 3).toUpperCase();
      const opacityVal = s.isOpen ? '1' : '0.55';

      const iconHtml = [
        '<div style="display:flex;flex-direction:column;align-items:center;opacity:' + opacityVal + '">',
        '<div style="background:rgba(15,23,42,0.97);border:2px solid ' + color + ';border-radius:10px;padding:4px 8px;min-width:82px;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,0.7);">',
        '<div style="color:' + color + ';font-size:9px;font-weight:800;letter-spacing:.5px">' + s.brand.slice(0, 3).toUpperCase() + '</div>',
        '<div style="color:#F8FAFC;font-size:11px;font-weight:700;margin-top:1px">' + priceLabel + '</div>',
        '</div>',
        '<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';margin-top:3px;border:2px solid #0F172A"></div>',
        '</div>',
      ].join('');

      return (
        '(function(){' +
        'var ic=L.divIcon({html:\'' + iconHtml.replace(/'/g, "\\'") + '\',iconSize:[88,50],iconAnchor:[44,50],className:\'\'});' +
        'var mk=L.marker([' + s.coordinates.latitude + ',' + s.coordinates.longitude + '],{icon:ic});' +
        'mk.on(\'click\',function(e){L.DomEvent.stopPropagation(e);window.ReactNativeWebView.postMessage(JSON.stringify({type:\'select\',id:\'' + s.id + '\'}));});' +
        'mk.addTo(map);' +
        '})();'
      );
    })
    .join('\n');

  const userDot = userLat
    ? 'L.marker([' + userLat + ',' + userLng + '],{icon:L.divIcon({html:\'<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,.35)"></div>\',iconSize:[16,16],iconAnchor:[8,8],className:\'\'})}).addTo(map);'
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;background:#0F172A}
.leaflet-tile-pane{filter:brightness(.72) saturate(.85) hue-rotate(5deg)}
.leaflet-control-zoom{border:1px solid #334155!important;border-radius:10px!important;overflow:hidden}
.leaflet-control-zoom a{background:#1E293B!important;color:#94A3B8!important;border-bottom:1px solid #334155!important;font-weight:700}
.leaflet-control-zoom a:hover{background:#334155!important;color:#F8FAFC!important}
.leaflet-control-attribution{display:none!important}
</style>
</head>
<body>
<div id="map"></div>
<script>
var map=L.map('map',{center:${center},zoom:15,zoomControl:true});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd'}).addTo(map);
${userDot}
${markersJS}
map.on('click',function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'deselect'}));});
window.centerOnUser=function(lat,lng){map.setView([lat,lng],16,{animate:true});};
<\/script>
</body>
</html>`;
}

// ─── MapScreen ────────────────────────────────────────────────────────────────

export function MapScreen() {
  const webViewRef = useRef<WebView>(null);
  const dispatch = useAppDispatch();
  const { stations, selectedStationId, filters } = useAppSelector(s => s.app);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (_) {}
      setLocationLoading(false);
    })();
  }, []);

  // Filtered + sorted stations
  const filteredStations = stations
    .filter(s => {
      if (filters.onlyOpen && !s.isOpen) return false;
      if (filters.onlyFavorites && !s.isFavorite) return false;
      if (filters.fuelType && !s.prices.find(p => p.type === filters.fuelType))
        return false;
      return true;
    })
    .map(s => ({
      ...s,
      distanceKm: userLocation
        ? haversineDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            s.coordinates.latitude,
            s.coordinates.longitude,
          )
        : s.distanceKm,
    }))
    .sort((a, b) => {
      if (filters.sortBy === 'distance')
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      const fuel = filters.fuelType ?? 'gasolina';
      const pa = a.prices.find(p => p.type === fuel)?.price ?? 999;
      const pb = b.prices.find(p => p.type === fuel)?.price ?? 999;
      return pa - pb;
    });

  const selectedStation =
    filteredStations.find(s => s.id === selectedStationId) ?? null;

  const html = buildLeafletHTML(
    filteredStations,
    userLocation?.latitude,
    userLocation?.longitude,
  );

  const centerOnUser = useCallback(async () => {
    if (userLocation) {
      webViewRef.current?.injectJavaScript(
        `window.centerOnUser(${userLocation.latitude},${userLocation.longitude});true;`,
      );
      return;
    }
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (_) {}
    setLocationLoading(false);
  }, [userLocation]);

  const onMessage = useCallback(
    (event: any) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'select') dispatch(selectStation(msg.id));
        if (msg.type === 'deselect') dispatch(selectStation(null));
      } catch (_) {}
    },
    [dispatch],
  );

  return (
    <View style={styles.container}>
      {/* Leaflet WebView */}
      <WebView
        ref={webViewRef}
        style={StyleSheet.absoluteFillObject}
        source={{ html }}
        originWhitelist={['*']}
        onMessage={onMessage}
        onLoad={() => setMapReady(true)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingFull}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Carregando mapa…</Text>
          </View>
        )}
      />

      {/* Top overlay */}
      <SafeAreaView
        edges={['top']}
        style={styles.topOverlay}
        pointerEvents="box-none"
      >
        <View style={styles.searchBar} pointerEvents="none">
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Buscar postos, rua, bairro…
          </Text>
        </View>
        <FilterBar />
      </SafeAreaView>

      {/* Station count badge */}
      {mapReady && (
        <View style={styles.countBadge} pointerEvents="none">
          <Ionicons
            name="location-outline"
            size={12}
            color={Colors.primary}
          />
          <Text style={styles.countText}>
            {filteredStations.length} posto
            {filteredStations.length !== 1 ? 's' : ''} encontrado
            {filteredStations.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* My location FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={centerOnUser}
        activeOpacity={0.85}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="locate-outline" size={22} color={Colors.primary} />
        )}
      </TouchableOpacity>

      {/* Bottom sheet for selected station */}
      {selectedStation && (
        <StationBottomSheet
          station={selectedStation}
          onClose={() => dispatch(selectStation(null))}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30,41,59,0.97)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  searchPlaceholder: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  countBadge: {
    position: 'absolute',
    top: 148,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(30,41,59,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countText: { color: Colors.textSecondary, fontSize: 12 },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
