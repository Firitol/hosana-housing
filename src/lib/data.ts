import { House, SubCity, Woreda, Kebele, User, AuditLog } from '@/lib/definitions';
import { AdministrativeBriefsInput } from '@/ai/flows/ai-administrative-briefs-flow';

// Mock data is kept for AI Brief generation, as server-side data fetching from
// Firestore without the Admin SDK is not supported in this environment.
// In a full production app, this would be replaced with Admin SDK calls.

const subCitiesMock: Omit<SubCity, 'createdAt' | 'updatedAt'>[] = [
  { id: '1', name: 'Arada' },
  { id: '2', name: 'Bole' },
  { id: '3', name: 'Gullele' },
];

const woredasMock: Omit<Woreda, 'createdAt' | 'updatedAt'>[] = [
  { id: '101', name: 'Woreda 01', subCityId: '1' },
  { id: '102', name: 'Woreda 02', subCityId: '1' },
  { id: '201', name: 'Woreda 03', subCityId: '2' },
  { id: '202', name: 'Woreda 04', subCityId: '2' },
  { id: '301', name: 'Woreda 05', subCityId: '3' },
];

const kebelesMock: Omit<Kebele, 'createdAt' | 'updatedAt'>[] = [
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

const housesMock: House[] = Array.from({ length: 55 }, (_, i) => {
  const woreda = woredasMock[i % woredasMock.length];
  const kebele = kebelesMock.find(k => k.woredaId === woreda.id) || kebelesMock[i % kebelesMock.length];
  const houseTypes: House['houseType'][] = ['Owned', 'Rented', 'Government'];

  return {
    id: `${1000 + i}`,
    houseNumber: `H${1000 + i}`,
    householderName: `Householder ${i + 1}`,
    phoneNumber: `0911${String(i).padStart(7, '0')}`,
    familySize: Math.floor(Math.random() * 8) + 1,
    houseType: houseTypes[i % houseTypes.length],
    addressDescription: `Some address near landmark ${i}`,
    latitude: 9.005401 + (Math.random() - 0.5) * 0.1,
    longitude: 38.763611 + (Math.random() - 0.5) * 0.1,
    subCityId: woreda.subCityId,
    woredaId: woreda.id,
    kebeleId: kebele.id,
    // @ts-ignore
    createdAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
    // @ts-ignore
    updatedAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
    createdBy: `user_${i%2}`
  };
});

const usersMock: User[] = [
    // @ts-ignore
  { id: 'user_0', fullName: 'Mr. Mayor', email: 'mayor@hosana.gov', role: 'Mayor' },
    // @ts-ignore
  { id: 'user_1', fullName: 'Subcity Official', email: 'subcity@hosana.gov', role: 'Sub-city Official' },
];

const auditLogsMock: AuditLog[] = Array.from({ length: 20 }, (_, i) => {
    const actions: AuditLog['action'][] = ['CREATE', 'UPDATE', 'DELETE'];
    const user = usersMock[i % usersMock.length];

    return {
        id: `${500 + i}`,
        // @ts-ignore
        timestamp: generateRandomDate(new Date(2024, 5, 1), new Date()),
        userId: user.id,
        action: actions[i % actions.length],
        tableName: 'House',
        recordId: `${1000 + i}`,
        description: `${user.fullName} performed ${actions[i % actions.length]} on House #${1000 + i}.`,
        userEmail: user.email,
    }
});


export const getDashboardStats = (): AdministrativeBriefsInput['dashboardStatistics'] => {
  const housesBySubcity = housesMock.reduce((acc, house) => {
    const subCityName = subCitiesMock.find(sc => sc.id === house.subCityId)?.name || 'Unknown';
    acc[subCityName] = (acc[subCityName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const housesByWoreda = housesMock.reduce((acc, house) => {
    const woredaName = woredasMock.find(w => w.id === house.woredaId)?.name || 'Unknown';
    acc[woredaName] = (acc[woredaName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const housesByKebele = housesMock.reduce((acc, house) => {
    const kebeleName = kebelesMock.find(k => k.woredaId === house.woredaId)?.name || 'Unknown';
    acc[kebeleName] = (acc[kebeleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedHouses = [...housesMock].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    totalHouses: housesMock.length,
    housesBySubcity,
    housesByWoreda,
    housesByKebele,
    recentlyAddedHouses: sortedHouses.slice(0, 5).map(h => ({ houseNumber: h.houseNumber, householderName: h.householderName, createdAt: h.createdAt as string })),
    recentlyUpdatedHouses: [...housesMock].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map(h => ({ houseNumber: h.houseNumber, householderName: h.householderName, updatedAt: h.updatedAt as string })),
  };
};

export const getAuditLogs = ({ limit }: { limit: number }): AdministrativeBriefsInput['auditLogs'] => {
    return [...auditLogsMock]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(log => ({
        timestamp: log.timestamp as string,
        user: log.userEmail,
        action: log.action,
        entityType: log.tableName,
        entityId: log.recordId,
        description: log.description
      }));
  };

    