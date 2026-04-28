export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Mayor' | 'Sub-city' | 'Woreda' | 'Kebele';
  avatarUrl: string;
};

export type SubCity = {
  id: string;
  name: string;
};

export type Woreda = {
  id: string;
  name: string;
  subCityId: string;
};

export type Kebele = {
  id: string;
  name: string;
  woredaId: string;
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
  gps: {
    lat: number;
    lng: number;
  };
  subCityId: string;
  woredaId: string;
  kebeleId: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'House' | 'User';
  entityId?: string;
  description: string;
};
