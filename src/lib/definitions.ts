import type { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: 'Mayor' | 'Sub-city Official' | 'Woreda Administrator' | 'Kebele Officer';
  phoneNumber: string;
  isActive: boolean;
  language?: 'English' | 'Amharic';
  subCityId?: string;
  kebeleId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type SubCity = {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Kebele = {
  id: string;
  name: string;
  subCityId: string;
  latitude: number;
  longitude: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Ketena = {
  id: string;
  name: string;
  kebeleId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type House = {
  id: string;
  houseNumber: string;
  householderName: string;
  phoneNumber: string;
  nationalId?: string;
  familySize: number;
  houseType: 'Owned' | 'Rented' | 'Government';
  addressDescription: string;
  latitude: number;
  longitude: number;
  subCityId: string;
  kebeleId: string;
  ketenaId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AuditLog = {
  id: string;
  timestamp: Timestamp;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: 'House' | 'User';
  recordId?: string;
  description: string;
};

// Type for Supercluster
export type GeoPoint = {
    type: "Feature";
    properties: {
        cluster: boolean;
        [key: string]: any;
    };
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
}
