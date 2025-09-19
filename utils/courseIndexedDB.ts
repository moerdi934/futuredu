// utils/courseIndexedDB.ts
export interface CourseAutoSaveData {
  courseTitle: string;
  courseDescription: string;
  courseImageUrl: string;
  learningPoints: string[];
  sections: any[];
  lastSaved: number;
  mode: 'create' | 'edit';
  courseId?: string;
}

class CourseIndexedDB {
  private dbName = 'CourseAutosaveDB';
  private version = 1;
  private storeName = 'courseAutosave';
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
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('lastSaved', 'lastSaved', { unique: false });
          store.createIndex('mode', 'mode', { unique: false });
        }
      };
    });
  }

  async saveAutosave(key: string, data: Omit<CourseAutoSaveData, 'lastSaved'>): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    const autosaveData: CourseAutoSaveData & { key: string } = {
      key,
      ...data,
      lastSaved: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(autosaveData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAutosave(key: string): Promise<CourseAutoSaveData | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          delete result.key; // Remove the key from the returned data
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAutosave(key: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAutosaves(): Promise<(CourseAutoSaveData & { key: string })[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllAutosaves(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const courseDB = new CourseIndexedDB();

// JSON Export/Import utilities
export const exportCourseToJSON = (data: CourseAutoSaveData): string => {
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(exportData, null, 2);
};

export const importCourseFromJSON = (jsonString: string): CourseAutoSaveData | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate required fields
    if (!data.courseTitle || !data.courseDescription || !Array.isArray(data.learningPoints) || !Array.isArray(data.sections)) {
      throw new Error('Invalid course data format');
    }
    
    return {
      courseTitle: data.courseTitle || '',
      courseDescription: data.courseDescription || '',
      courseImageUrl: data.courseImageUrl || '',
      learningPoints: data.learningPoints || [],
      sections: data.sections || [],
      lastSaved: Date.now(),
      mode: data.mode || 'create',
      courseId: data.courseId
    };
  } catch (error) {
    console.error('Error importing course from JSON:', error);
    return null;
  }
};

export const downloadJSONFile = (filename: string, data: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};