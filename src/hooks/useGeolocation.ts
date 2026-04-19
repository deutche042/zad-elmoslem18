'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export type PermissionState = 'granted' | 'prompt' | 'denied' | 'unavailable' | 'checking';

interface UseGeolocationReturn {
  location: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  error: string | null;
  permissionState: PermissionState;
  requestLocation: () => void;
  setManualLocation: (lat: number, lng: number, name: string) => void;
  isUsingDefault: boolean;
  checkAndRequest: () => Promise<PermissionState>;
}

export function useGeolocation(): UseGeolocationReturn {
  const { locationLat, locationLng, locationName, setLocation } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');

  const isDefaultLocation = locationLat === 30.0444 && locationLng === 31.2357 && locationName === 'القاهرة';

  const location =
    locationLat !== null && locationLng !== null
      ? { latitude: locationLat, longitude: locationLng }
      : null;

  const requestLocation = useCallback(() => {
    if (!navigator?.geolocation) {
      setPermissionState('unavailable');
      setError('Geolocation is not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`
          );
          const geoData = await geoRes.json();
          const cityName =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.state ||
            'موقعك';
          setLocation(latitude, longitude, cityName);
        } catch {
          setLocation(latitude, longitude, 'موقعك');
        }
        setPermissionState('granted');
        setIsLoading(false);
      },
      (err) => {
        if (err.code === 1) {
          setPermissionState('denied');
          setError('Location permission denied');
        } else if (err.code === 2) {
          setPermissionState('unavailable');
          setError('Location unavailable');
        } else {
          setPermissionState('prompt');
          setError('Location request timed out');
        }
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }, [setLocation]);

  const setManualLocation = useCallback(
    (lat: number, lng: number, name: string) => {
      setLocation(lat, lng, name);
      setError(null);
      setPermissionState('granted');
    },
    [setLocation]
  );

  const permissionsRef = useCallback(async (): Promise<{ result: PermissionState; cleanup: (() => void) | null }> => {
    if (typeof navigator === 'undefined' || !navigator?.permissions) {
      if (isDefaultLocation) {
        requestLocation();
      }
      return { result: 'prompt', cleanup: null };
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const state = result.state as PermissionState;

      const handleChange = () => {
        const newState = result.state as PermissionState;
        setPermissionState(newState);
      };

      result.addEventListener('change', handleChange);

      if (state === 'prompt' && isDefaultLocation) {
        requestLocation();
      }

      return { result: state, cleanup: () => result.removeEventListener('change', handleChange) };
    } catch {
      if (isDefaultLocation) {
        requestLocation();
      }
      return { result: 'prompt', cleanup: null };
    }
  }, [requestLocation, isDefaultLocation]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let settled = false;
    permissionsRef().then(({ cleanup: c }) => {
      if (!settled) {
        cleanup = c;
      } else if (c) {
        c();
      }
    });
    return () => {
      settled = true;
      if (cleanup) {
        cleanup();
      }
    };
  }, [permissionsRef]);

  const checkAndRequest = useCallback(async (): Promise<PermissionState> => {
    const { result } = await permissionsRef();
    return result;
  }, [permissionsRef]);

  return {
    location,
    isLoading,
    error,
    permissionState,
    requestLocation,
    setManualLocation,
    isUsingDefault: isDefaultLocation,
    checkAndRequest,
  };
}
