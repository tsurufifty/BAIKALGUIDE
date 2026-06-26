'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LocationEntry } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
// Centred on Lake Baikal / Buryatia. Yandex v3 uses [lng, lat] order (like GeoJSON).
const DEFAULT_CENTER: [number, number] = [108.2, 53.2];

type LngLat = [number, number];

interface YFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'Point'; coordinates: LngLat };
  properties: { title: string };
}

interface YMapInstance {
  addChild(child: unknown): YMapInstance;
  destroy(): void;
}

interface YClusterer {
  update(props: { features: YFeature[] }): void;
}

interface ClustererOptions {
  method: unknown;
  features: YFeature[];
  marker: (feature: YFeature) => unknown;
  cluster: (coordinates: LngLat, features: YFeature[]) => unknown;
}

/** Minimal surface of the Yandex Maps v3 global we actually use. */
interface Ymaps3 {
  ready: Promise<void>;
  YMap: new (el: HTMLElement, props: { location: { center: LngLat; zoom: number } }) => YMapInstance;
  YMapDefaultSchemeLayer: new () => unknown;
  YMapDefaultFeaturesLayer: new () => unknown;
  YMapMarker: new (props: { coordinates: LngLat }, element: HTMLElement) => unknown;
  import(pkg: string): Promise<Record<string, unknown>>;
}

declare global {
  // eslint-disable-next-line no-var
  var ymaps3: Ymaps3 | undefined;
}

function loadYmaps(apiKey: string, lang: string): Promise<Ymaps3> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.ymaps3) return window.ymaps3.ready.then(() => window.ymaps3 as Ymaps3);

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (!window.ymaps3) return reject(new Error('ymaps3 failed to load'));
      window.ymaps3.ready.then(() => resolve(window.ymaps3 as Ymaps3));
    };
    const existing = document.getElementById('ymaps3-script');
    if (existing) {
      existing.addEventListener('load', finish);
      existing.addEventListener('error', () => reject(new Error('ymaps3 failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'ymaps3-script';
    s.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=${lang}`;
    s.async = true;
    s.onload = finish;
    s.onerror = () => reject(new Error('ymaps3 failed to load'));
    document.head.appendChild(s);
  });
}

function toFeatures(locations: LocationEntry[]): YFeature[] {
  return locations
    .filter((l) => l.coordinates)
    .map((l) => ({
      type: 'Feature' as const,
      id: l.documentId,
      geometry: { type: 'Point' as const, coordinates: [l.coordinates.longitude, l.coordinates.latitude] as LngLat },
      properties: { title: l.title },
    }));
}

function markerEl(title: string): HTMLElement {
  const el = document.createElement('div');
  el.title = title;
  el.style.cssText =
    'width:14px;height:14px;border-radius:50%;background:#C86B3C;border:2px solid #F5F1E8;' +
    'box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer;transform:translate(-50%,-50%)';
  return el;
}

function clusterEl(count: number): HTMLElement {
  const el = document.createElement('div');
  el.textContent = String(count);
  el.style.cssText =
    'min-width:34px;height:34px;padding:0 8px;border-radius:18px;background:#1F4D3A;color:#F5F1E8;' +
    'display:flex;align-items:center;justify-content:center;font:600 13px/1 sans-serif;' +
    'border:2px solid #F5F1E8;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;transform:translate(-50%,-50%)';
  return el;
}

export function MapView({ locations, lang = 'ru_RU' }: { locations: LocationEntry[]; lang?: string }) {
  const t = useTranslations('MapPage');
  const containerRef = useRef<HTMLDivElement>(null);
  const clustererRef = useRef<YClusterer | null>(null);
  const locationsRef = useRef<LocationEntry[]>(locations);
  const [failed, setFailed] = useState(false);

  // Init once per language (locale change remounts via route navigation anyway).
  useEffect(() => {
    if (!API_KEY || !containerRef.current) return;
    let cancelled = false;
    let map: YMapInstance | null = null;

    (async () => {
      try {
        const ymaps3 = await loadYmaps(API_KEY, lang);
        if (cancelled || !containerRef.current) return;

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;
        map = new YMap(containerRef.current, { location: { center: DEFAULT_CENTER, zoom: 5 } });
        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());

        const mod = await ymaps3.import('@yandex/ymaps3-clusterer');
        const YMapClusterer = mod.YMapClusterer as new (o: ClustererOptions) => YClusterer;
        const clusterByGrid = mod.clusterByGrid as (o: { gridSize: number }) => unknown;

        const clusterer = new YMapClusterer({
          method: clusterByGrid({ gridSize: 64 }),
          features: toFeatures(locationsRef.current),
          marker: (f) => new YMapMarker({ coordinates: f.geometry.coordinates }, markerEl(f.properties.title)),
          cluster: (coordinates, features) => new YMapMarker({ coordinates }, clusterEl(features.length)),
        });
        map.addChild(clusterer);
        clustererRef.current = clusterer;
      } catch (e) {
        console.warn('[map] Yandex Maps init failed:', (e as Error).message);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      clustererRef.current = null;
      map?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Re-cluster when the filtered list changes.
  useEffect(() => {
    locationsRef.current = locations;
    clustererRef.current?.update({ features: toFeatures(locations) });
  }, [locations]);

  if (!API_KEY) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-card border border-dashed border-foreground/15 bg-secondary/5 px-6 text-center text-muted">
        {t('noApiKey')}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-card border border-dashed border-foreground/15 bg-secondary/5 px-6 text-center text-muted">
        {t('loadError')}
      </div>
    );
  }

  return <div ref={containerRef} className="h-[70vh] w-full overflow-hidden rounded-card" />;
}
