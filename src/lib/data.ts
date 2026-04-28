import { House, SubCity, Kebele, Ketena, User, AuditLog } from '@/lib/definitions';
import { AdministrativeBriefsInput } from '@/ai/flows/ai-administrative-briefs-flow';

// --- REALISTIC SEED DATA GENERATION ---

// 1. Administrative Divisions
const subCitiesMock: Omit<SubCity, 'createdAt' | 'updatedAt'>[] = [
  { id: 'sc-1', name: 'Gofer Meda' },
  { id: 'sc-2', name: 'Sech Duna' },
  { id: 'sc-3', name: 'Addis' },
];

const kebelesMock: Omit<Kebele, 'createdAt' | 'updatedAt'>[] = [
  // Gofer Meda Kebeles
  { id: 'kb-1', name: 'Arada', subCityId: 'sc-1', latitude: 7.56, longitude: 37.85 },
  { id: 'kb-2', name: 'Bobicho', subCityId: 'sc-1', latitude: 7.57, longitude: 37.86 },
  // Sech Duna Kebeles
  { id: 'kb-3', name: 'Heto', subCityId: 'sc-2', latitude: 7.55, longitude: 37.90 },
  { id: 'kb-4', name: 'Sech Duna Kebele', subCityId: 'sc-2', latitude: 7.54, longitude: 37.91 },
  // Addis Kebeles
  { id: 'kb-5', name: 'Lich Amba', subCityId: 'sc-3', latitude: 7.60, longitude: 37.95 },
  { id: 'kb-6', name: 'Jello Naramo', subCityId: 'sc-3', latitude: 7.61, longitude: 37.96 },
];

const ketenasMock: Omit<Ketena, 'createdAt' | 'updatedAt'>[] = [
  // Arada Ketenas
  { id: 'kt-1', name: 'Ketena 1', kebeleId: 'kb-1' },
  { id: 'kt-2', name: 'Ketena 2', kebeleId: 'kb-1' },
  // Bobicho Ketenas
  { id: 'kt-3', name: 'Ketena 3', kebeleId: 'kb-2' },
  // Heto Ketenas
  { id: 'kt-4', name: 'Ketena 4', kebeleId: 'kb-3' },
  { id: 'kt-5', name: 'Ketena 5', kebeleId: 'kb-3' },
  // Sech Duna Ketenas
  { id: 'kt-6', name: 'Ketena 6', kebeleId: 'kb-4' },
  // Lich Amba Ketenas
  { id: 'kt-7', name: 'Ketena 7', kebeleId: 'kb-5' },
  { id: 'kt-8', name: 'Ketena 8', kebeleId: 'kb-5' },
  // Jello Naramo Ketenas
  { id: 'kt-9', name: 'Ketena 9', kebeleId: 'kb-6' },
  { id: 'kt-10', name: 'Ketena 10', kebeleId: 'kb-6' },
];


// 2. Data for Houses
const firstNames = ['Abebe', 'Lelisa', 'Fatuma', 'Mekdes', 'Yohannes', 'Birtukan', 'Tsegaye', 'Freweini', 'Haile', 'Sofia', 'Getachew', 'Zenebech', 'Dawit', 'Meseret', 'Kassahun', 'Tigist'];
const lastNames = ['Bekele', 'Dadi', 'Ahmed', 'Gebre', 'Tadesse', 'Mamo', 'Haile', 'Abdi', 'Wolde', 'Ali', 'Nigussie', 'Assefa', 'Girma', 'Mengesha', 'Zewde'];
const houseTypes: House['houseType'][] = ['Owned', 'Rented', 'Government'];

// Helper Functions
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const generatePhoneNumber = () => `09${Math.floor(10000000 + Math.random() * 90000000)}`;

const generateCoordinates = (baseLat: number, baseLng: number) => ({
  lat: baseLat + (Math.random() - 0.5) * 0.005, // within ~500m of kebele center
  lng: baseLng + (Math.random() - 0.5) * 0.005,
});

// 3. Generate House Records
const housesMock: House[] = Array.from({ length: 80 }, (_, i) => {
  const ketena = getRandomItem(ketenasMock);
  const kebele = kebelesMock.find(k => k.id === ketena.kebeleId)!;
  const subCity = subCitiesMock.find(sc => sc.id === kebele.subCityId)!;
  const coords = generateCoordinates(kebele.latitude, kebele.longitude);

  return {
    id: `${1000 + i}`,
    houseNumber: `HOS-${String(1001 + i).padStart(4, '0')}`,
    householderName: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
    phoneNumber: generatePhoneNumber(),
    familySize: Math.floor(Math.random() * 8) + 1,
    houseType: getRandomItem(houseTypes),
    addressDescription: `Near ${getRandomItem(['market', 'school', 'church', 'clinic'])} in ${ketena.name}`,
    latitude: coords.lat,
    longitude: coords.lng,
    subCityId: subCity.id,
    kebeleId: kebele.id,
    ketenaId: ketena.id,
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
  
  const housesByKebele = housesMock.reduce((acc, house) => {
    const kebeleName = kebelesMock.find(k => k.id === house.kebeleId)?.name || 'Unknown';
    acc[kebeleName] = (acc[kebeleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const housesByKetena = housesMock.reduce((acc, house) => {
    const ketenaName = ketenasMock.find(k => k.id === house.ketenaId)?.name || 'Unknown';
    acc[ketenaName] = (acc[ketenaName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedHouses = [...housesMock].sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  return {
    totalHouses: housesMock.length,
    housesBySubcity,
    // @ts-ignore
    housesByWoreda: {}, // Kept for schema compatibility, but empty
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
