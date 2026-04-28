import { House, SubCity, Woreda, Kebele, User, AuditLog } from '@/lib/definitions';
import { AdministrativeBriefsInput } from '@/ai/flows/ai-administrative-briefs-flow';

// --- REALISTIC SEED DATA GENERATION ---

// 1. Administrative Divisions
const subCitiesMock: Omit<SubCity, 'createdAt' | 'updatedAt'>[] = [
  { id: 'sc-1', name: 'Hosaena Central' },
  { id: 'sc-2', name: 'Lemo' },
  { id: 'sc-3', name: 'Misha' },
];

const woredasMock: Omit<Woreda, 'createdAt' | 'updatedAt'>[] = [
  // Hosaena Central Woredas
  { id: 'wd-1', name: 'Woreda 01', subCityId: 'sc-1' },
  { id: 'wd-2', name: 'Woreda 02', subCityId: 'sc-1' },
  { id: 'wd-3', name: 'Woreda 03', subCityId: 'sc-1' },
  { id: 'wd-4', name: 'Woreda 04', subCityId: 'sc-1' },
  // Lemo Woredas
  { id: 'wd-5', name: 'Woreda 05', subCityId: 'sc-2' },
  { id: 'wd-6', name: 'Woreda 06', subCityId: 'sc-2' },
  { id: 'wd-7', name: 'Woreda 07', subCityId: 'sc-2' },
  // Misha Woredas
  { id: 'wd-8', name: 'Woreda 08', subCityId: 'sc-3' },
  { id: 'wd-9', name: 'Woreda 09', subCityId: 'sc-3' },
  { id: 'wd-10', name: 'Woreda 10', subCityId: 'sc-3' },
];

const kebelesMock: Omit<Kebele, 'createdAt' | 'updatedAt'>[] = [
  // Woreda 01 Kebeles
  { id: 'kb-1', name: 'Kebele A', woredaId: 'wd-1' },
  { id: 'kb-2', name: 'Kebele B', woredaId: 'wd-1' },
  // Woreda 02 Kebeles
  { id: 'kb-3', name: 'Kebele C', woredaId: 'wd-2' },
  // Woreda 03 Kebeles
  { id: 'kb-4', name: 'Kebele D', woredaId: 'wd-3' },
  { id: 'kb-5', name: 'Kebele E', woredaId: 'wd-3' },
  // Woreda 04 Kebeles
  { id: 'kb-6', name: 'Kebele F', woredaId: 'wd-4' },
  // Woreda 05 Kebeles
  { id: 'kb-7', name: 'Kebele G', woredaId: 'wd-5' },
  { id: 'kb-8', name: 'Kebele H', woredaId: 'wd-5' },
  // Woreda 06 Kebeles
  { id: 'kb-9', name: 'Kebele I', woredaId: 'wd-6' },
  // Woreda 07 Kebeles
  { id: 'kb-10', name: 'Kebele J', woredaId: 'wd-7' },
  { id: 'kb-11', name: 'Kebele K', woredaId: 'wd-7' },
  // Woreda 08 Kebeles
  { id: 'kb-12', name: 'Kebele L', woredaId: 'wd-8' },
  // Woreda 09 Kebeles
  { id: 'kb-13', name: 'Kebele M', woredaId: 'wd-9' },
  { id: 'kb-14', name: 'Kebele N', woredaId: 'wd-9' },
  // Woreda 10 Kebeles
  { id: 'kb-15', name: 'Kebele O', woredaId: 'wd-10' },
];

// 2. Data for Houses
const firstNames = ['Abebe', 'Lelisa', 'Fatuma', 'Mekdes', 'Yohannes', 'Birtukan', 'Tsegaye', 'Freweini', 'Haile', 'Sofia', 'Getachew', 'Zenebech', 'Dawit', 'Meseret', 'Kassahun', 'Tigist'];
const lastNames = ['Bekele', 'Dadi', 'Ahmed', 'Gebre', 'Tadesse', 'Mamo', 'Haile', 'Abdi', 'Wolde', 'Ali', 'Nigussie', 'Assefa', 'Girma', 'Mengesha', 'Zewde'];
const houseTypes: House['houseType'][] = ['Owned', 'Rented', 'Government'];

// Helper Functions
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const generatePhoneNumber = () => `09${Math.floor(10000000 + Math.random() * 90000000)}`;
const generateCoordinates = () => ({
  lat: 7.5 + Math.random() * 0.2, // Latitude: 7.5 - 7.7
  lng: 37.8 + Math.random() * 0.3, // Longitude: 37.8 - 38.1
});

// 3. Generate House Records
const housesMock: House[] = Array.from({ length: 75 }, (_, i) => {
  const kebele = getRandomItem(kebelesMock);
  const woreda = woredasMock.find(w => w.id === kebele.woredaId)!;
  const subCity = subCitiesMock.find(sc => sc.id === woreda.subCityId)!;
  const coords = generateCoordinates();

  return {
    id: `${1000 + i}`,
    houseNumber: `HOS-${String(1001 + i).padStart(4, '0')}`,
    householderName: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
    phoneNumber: generatePhoneNumber(),
    familySize: Math.floor(Math.random() * 8) + 1,
    houseType: getRandomItem(houseTypes),
    addressDescription: `Near ${getRandomItem(['market', 'school', 'church', 'clinic'])} in ${kebele.name}`,
    latitude: coords.lat,
    longitude: coords.lng,
    subCityId: subCity.id,
    woredaId: woreda.id,
    kebeleId: kebele.id,
    // @ts-ignore
    createdAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
    // @ts-ignore
    updatedAt: generateRandomDate(new Date(), new Date()),
    createdBy: `user_${i % 2}`
  };
});

// 4. Users and Audit Logs
const usersMock: User[] = [
    // @ts-ignore
  { id: 'user_0', fullName: 'Abebe Bikila', email: 'mayor@hosana.gov', role: 'Mayor' },
    // @ts-ignore
  { id: 'user_1', fullName: 'Fatuma Roba', email: 'subcity@hosana.gov', role: 'Sub-city Official' },
];

const auditLogsMock: AuditLog[] = Array.from({ length: 20 }, (_, i) => {
    const actions: AuditLog['action'][] = ['CREATE', 'UPDATE', 'DELETE'];
    const user = usersMock[i % usersMock.length];
    const house = housesMock[i % housesMock.length];

    return {
        id: `${500 + i}`,
        // @ts-ignore
        timestamp: generateRandomDate(new Date(2024, 5, 1), new Date()),
        userId: user.id,
        action: getRandomItem(actions),
        tableName: 'House',
        recordId: house.id,
        description: `${user.fullName} performed ${actions[i % actions.length]} on House ${house.houseNumber}.`,
        userEmail: user.email,
    }
});


// --- FUNCTIONS TO PROVIDE DATA TO THE APP ---

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
    const kebeleName = kebelesMock.find(k => k.id === house.kebeleId)?.name || 'Unknown';
    acc[kebeleName] = (acc[kebeleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedHouses = [...housesMock].sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  return {
    totalHouses: housesMock.length,
    housesBySubcity,
    housesByWoreda,
    housesByKebele,
    recentlyAddedHouses: sortedHouses.slice(0, 5).map(h => ({ houseNumber: h.houseNumber, householderName: h.householderName, createdAt: h.createdAt as string })),
    recentlyUpdatedHouses: [...housesMock].sort((a,b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime()).slice(0, 5).map(h => ({ houseNumber: h.houseNumber, householderName: h.householderName, updatedAt: h.updatedAt as string })),
  };
};

export const getAuditLogs = ({ limit }: { limit: number }): AdministrativeBriefsInput['auditLogs'] => {
    return [...auditLogsMock]
      .sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime())
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
