import { House, SubCity, Woreda, Kebele, User, AuditLog } from '@/lib/definitions';
import { AdministrativeBriefsInput } from '@/ai/flows/ai-administrative-briefs-flow';

export const subCities: SubCity[] = [
  { id: '1', name: 'Arada' },
  { id: '2', name: 'Bole' },
  { id: '3', name: 'Gullele' },
];

export const woredas: Woreda[] = [
  { id: '101', name: 'Woreda 01', subCityId: '1' },
  { id: '102', name: 'Woreda 02', subCityId: '1' },
  { id: '201', name: 'Woreda 03', subCityId: '2' },
  { id: '202', name: 'Woreda 04', subCityId: '2' },
  { id: '301', name: 'Woreda 05', subCityId: '3' },
];

export const kebeles: Kebele[] = [
  { id: '10101', name: 'Kebele A', woredaId: '101' },
  { id: '10102', name: 'Kebele B', woredaId: '101' },
  { id: '10201', name: 'Kebele C', woredaId: '102' },
  { id: '20101', name: 'Kebele D', woredaId: '201' },
  { id: '20201', name: 'Kebele E', woredaId: '202' },
  { id: '30101', name: 'Kebele F', woredaId: '301' },
];

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const generateRandomGps = () => ({
    lat: 9.005401 + (Math.random() - 0.5) * 0.1,
    lng: 38.763611 + (Math.random() - 0.5) * 0.1,
});

export const houses: House[] = Array.from({ length: 55 }, (_, i) => {
  const woreda = woredas[i % woredas.length];
  const kebele = kebeles.find(k => k.woredaId === woreda.id) || kebeles[i % kebeles.length];
  const houseTypes: House['houseType'][] = ['Owned', 'Rented', 'Government'];

  return {
    id: `${1000 + i}`,
    houseNumber: `H${1000 + i}`,
    householderName: `Householder ${i + 1}`,
    phoneNumber: `0911${String(i).padStart(7, '0')}`,
    familySize: Math.floor(Math.random() * 8) + 1,
    houseType: houseTypes[i % houseTypes.length],
    addressDescription: `Some address near landmark ${i}`,
    gps: generateRandomGps(),
    subCityId: woreda.subCityId,
    woredaId: woreda.id,
    kebeleId: kebele.id,
    createdAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
  };
});

export const users: User[] = [
  { id: '1', name: 'Mr. Mayor', email: 'mayor@hosana.gov', role: 'Mayor', avatarUrl: '/avatar-placeholder.png' },
  { id: '2', name: 'Subcity Official', email: 'subcity@hosana.gov', role: 'Sub-city', avatarUrl: '/avatar-placeholder.png' },
];

export const auditLogs: AuditLog[] = Array.from({ length: 20 }, (_, i) => {
    const actions: AuditLog['action'][] = ['CREATE', 'UPDATE', 'DELETE'];
    const user = users[i % users.length];

    return {
        id: `${500 + i}`,
        timestamp: generateRandomDate(new Date(2024, 5, 1), new Date()),
        user: user.name,
        userId: user.id,
        action: actions[i % actions.length],
        entityType: 'House',
        entityId: `${1000 + i}`,
        description: `${user.name} performed ${actions[i % actions.length]} on House #${1000 + i}.`,
    }
});

export const getDashboardStats = (): AdministrativeBriefsInput['dashboardStatistics'] => {
  const housesBySubcity = houses.reduce((acc, house) => {
    const subCityName = subCities.find(sc => sc.id === house.subCityId)?.name || 'Unknown';
    acc[subCityName] = (acc[subCityName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const housesByWoreda = houses.reduce((acc, house) => {
    const woredaName = woredas.find(w => w.id === house.woredaId)?.name || 'Unknown';
    acc[woredaName] = (acc[woredaName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const housesByKebele = houses.reduce((acc, house) => {
    const kebeleName = kebeles.find(k => k.id === house.kebeleId)?.name || 'Unknown';
    acc[kebeleName] = (acc[kebeleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedHouses = [...houses].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    totalHouses: houses.length,
    housesBySubcity,
    housesByWoreda,
    housesByKebele,
    recentlyAddedHouses: sortedHouses.slice(0, 5).map(h => ({ houseNumber: h.houseNumber, householderName: h.householderName, createdAt: h.createdAt })),
    recentlyUpdatedHouses: [...houses].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map(h => ({ houseNumber: h.houseNumber, householderName: h.householderName, updatedAt: h.updatedAt })),
  };
};

export const getAuditLogs = ({ limit }: { limit: number }): AdministrativeBriefsInput['auditLogs'] => {
  return [...auditLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit).map(log => ({
    timestamp: log.timestamp,
    user: log.user,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    description: log.description
  }));
};
