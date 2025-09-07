// IndexedDB utilities for offline storage
class HealthStorage {
  private dbName = 'healthai-storage';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('vitals')) {
          const vitalsStore = db.createObjectStore('vitals', { keyPath: 'id', autoIncrement: true });
          vitalsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('reports')) {
          const reportsStore = db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
          reportsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  async saveVitals(vitals: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['vitals'], 'readwrite');
      const store = transaction.objectStore('vitals');
      const request = store.add({ ...vitals, timestamp: Date.now(), synced: false });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVitals(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['vitals'], 'readonly');
      const store = transaction.objectStore('vitals');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveReport(report: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      const request = store.add({ ...report, timestamp: Date.now(), synced: false });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getReports(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedData(): Promise<{ vitals: any[], reports: any[] }> {
    if (!this.db) await this.init();

    const vitals = await this.getVitals();
    const reports = await this.getReports();

    return {
      vitals: vitals.filter(item => !item.synced),
      reports: reports.filter(item => !item.synced)
    };
  }

  async markAsSynced(type: 'vitals' | 'reports', ids: number[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      
      let completed = 0;
      const total = ids.length;

      ids.forEach(id => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const record = getRequest.result;
          if (record) {
            record.synced = true;
            const putRequest = store.put(record);
            putRequest.onsuccess = () => {
              completed++;
              if (completed === total) resolve();
            };
            putRequest.onerror = () => reject(putRequest.error);
          }
        };
      });

      if (total === 0) resolve();
    });
  }
}

export const healthStorage = new HealthStorage();