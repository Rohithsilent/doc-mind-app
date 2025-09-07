import { useState, useEffect } from 'react';
import { healthStorage } from '@/lib/storage';
import { useOffline } from './useOffline';

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const isOffline = useOffline();

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Initialize storage
    healthStorage.init().catch(console.error);

    // Service Worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    // Background sync when coming back online
    const handleOnline = () => {
      syncOfflineData();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const syncOfflineData = async () => {
    try {
      const unsyncedData = await healthStorage.getUnsyncedData();
      
      // Sync vitals
      if (unsyncedData.vitals.length > 0) {
        // Here you would typically sync with your backend
        console.log('Syncing vitals:', unsyncedData.vitals);
        
        // Mark as synced (in a real app, only after successful API call)
        const vitalIds = unsyncedData.vitals.map(v => v.id);
        await healthStorage.markAsSynced('vitals', vitalIds);
      }

      // Sync reports
      if (unsyncedData.reports.length > 0) {
        console.log('Syncing reports:', unsyncedData.reports);
        
        const reportIds = unsyncedData.reports.map(r => r.id);
        await healthStorage.markAsSynced('reports', reportIds);
      }

      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
          window.location.reload();
        }
      });
    }
  };

  const cacheHealthData = async (type: string, data: any) => {
    try {
      await healthStorage.cacheData(type, data);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const getCachedHealthData = async (type: string) => {
    try {
      return await healthStorage.getCachedData(type);
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  return {
    isInstalled,
    isOffline,
    updateAvailable,
    updateApp,
    syncOfflineData,
    cacheHealthData,
    getCachedHealthData
  };
};