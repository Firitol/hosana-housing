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
  woredaId?: string;
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

export type Woreda = {
  id: string;
  name: string;
  subCityId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Kebele = {
  id: string;
  name: string;
  woredaId: string;
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
  woredaId: string;
  kebeleId: string;
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

    