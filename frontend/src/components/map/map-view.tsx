'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LocationEntry } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
// Yandex Maps 2.1 uses [lat, lng] order. Centred on Lake Baikal / Buryatia.
const DEFAULT_CENTER: [number, number] = [53.2, 108.2];
const DEFAULT_ZOOM = 5;

/** Minimal surface of the Yandex Maps 2.1 global we actually use. */
interface YmapsGeoObject {
  add(objects: unknown): void;
  removeAll(): void;
  getBounds(): number[][] | null;
}
interface YmapsMap {
  geoObjects: { add(obj: unknown): void };
  setBounds(bounds: number[][], opts?: Record<string, unknown>): void;
  destroy(): void;
}
interface Ymaps {
  ready(cb: () => void): void;
  Map: new (
    el: HTMLElement | string,
    state: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => YmapsMap;
  Placemark: new (
    coords: [number, number],
    props?: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => unknown;
  Clusterer: new (opts?: Record<string, unknown>) => YmapsGeoObject;
}

declare global {
  // eslint-disable-next-line no-var
  var ymaps: Ymaps | undefined;
}

function loadYmaps(apiKey: string, lang: string): Promise<Ymaps> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.ymaps) {
    return new Promise((resolve) => window.ymaps!.ready(() => resolve(window.ymaps as Ymaps)));
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (!window.ymaps) return reject(new Error('ymaps failed to load'));
      window.ymaps.ready(() => resolve(window.ymaps as Ymaps));
    };
    const existing = document.getElementById('ymaps-script');
    if (existing) {
      existing.addEventListener('load', finish);
      existing.addEventListener('error', () => reject(new Error('ymaps failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'ymaps-script';
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=${lang}`;
    s.async = true;
    s.onload = finish;
    s.onerror = () => reject(new Error('ymaps failed to load'));
    document.head.appendChild(s);
  });
}

function buildPlacemarks(ymaps: Ymaps, locations: LocationEntry[]): unknown[] {
  return locations
    .filter((l) => l.coordinates)
    .map(
      (l) =>
        new ymaps.Placemark(
          [l.coordinates.latitude, l.coordinates.longitude],
          { hintContent: l.title, balloonContentHeader: l.title },
          { preset: 'islands#orangeDotIcon' },
        ),
    );
}

function fitBounds(map: YmapsMap, clusterer: YmapsGeoObject): void {
  const bounds = clusterer.getBounds();
  if (!bounds) return;
  try {
    map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
  } catch {
    /* single point / bounds unavailable — keep default view */
  }
}

export function MapView({ locations, lang = 'ru_RU' }: { locations: LocationEntry[]; lang?: string }) {
  const t = useTranslations('MapPage');
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YmapsMap | null>(null);
  const clustererRef = useRef<YmapsGeoObject | null>(null);
  const ymapsRef = useRef<Ymaps | null>(null);
  const locationsRef = useRef<LocationEntry[]>(locations);
  const [failed, setFailed] = useState(false);

  // Init once per language (locale change remounts via route navigation anyway).
  useEffect(() => {
    if (!API_KEY || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const ymaps = await loadYmaps(API_KEY, lang);
        if (cancelled || !containerRef.current) return;
        ymapsRef.current = ymaps;

        const map = new ymaps.Map(
          containerRef.current,
          { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, controls: ['zoomControl', 'geolocationControl'] },
          { suppressMapOpenBlock: true },
        );
        mapRef.current = map;

        const clusterer = new ymaps.Clusterer({
          preset: 'islands#darkGreenClusterIcons',
          groupByCoordinates: false,
          clusterDisableClickZoom: false,
        });
        clusterer.add(buildPlacemarks(ymaps, locationsRef.current));
        map.geoObjects.add(clusterer);
        clustererRef.current = clusterer;
        fitBounds(map, clusterer);
      } catch (e) {
        console.warn('[map] Yandex Maps init failed:', (e as Error).message);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      clustererRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Re-cluster when the filtered list changes.
  useEffect(() => {
    locationsRef.current = locations;
    const ymaps = ymapsRef.current;
    const clusterer = clustererRef.current;
    const map = mapRef.current;
    if (!ymaps || !clusterer) return;
    clusterer.removeAll();
    clusterer.add(buildPlacemarks(ymaps, locations));
    if (map) fitBounds(map, clusterer);
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
