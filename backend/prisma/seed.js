const prisma = require('../src/config/db');

const STATE_ID = '00000000-0000-0000-0000-000000000001';
const DISTRICT_ID = '00000000-0000-0000-0000-000000000101';

const ZONE_IDS = {
  BHURAGAON: '00000000-0000-0000-0000-000000001001',
  MAYONG: '00000000-0000-0000-0000-000000001002',
  LAHARIGHAT: '00000000-0000-0000-0000-000000001003',
};

const SETTLEMENT_IDS = {
  A: '00000000-0000-0000-0000-000000002001',
  B: '00000000-0000-0000-0000-000000002002',
  C: '00000000-0000-0000-0000-000000002003',
  D: '00000000-0000-0000-0000-000000002004',
  E: '00000000-0000-0000-0000-000000002005',
};

async function main() {
  console.log('\n========================================');
  console.log('RAKSHAGRID DATABASE SEED');
  console.log('DEVELOPMENT / TEST DATA ONLY');
  console.log('========================================\n');

  const assam = await prisma.state.upsert({
    where: { id: STATE_ID },
    update: { name: 'Assam', code: 'AS' },
    create: { id: STATE_ID, name: 'Assam', code: 'AS' },
  });

  console.log(`✓ State: ${assam.name}`);

  const morigaon = await prisma.district.upsert({
    where: { id: DISTRICT_ID },
    update: { name: 'Morigaon', stateId: assam.id },
    create: {
      id: DISTRICT_ID,
      name: 'Morigaon',
      stateId: assam.id,
    },
  });

  console.log(`✓ District: ${morigaon.name}`);

  const bhuragaon = await prisma.zone.upsert({
    where: { id: ZONE_IDS.BHURAGAON },
    update: {
      name: 'Bhuragaon Circle',
      districtId: morigaon.id,
      hazardScore: 0.87,
      riskClass: 'RED',
    },
    create: {
      id: ZONE_IDS.BHURAGAON,
      name: 'Bhuragaon Circle',
      districtId: morigaon.id,
      hazardScore: 0.87,
      riskClass: 'RED',
    },
  });

  const mayong = await prisma.zone.upsert({
    where: { id: ZONE_IDS.MAYONG },
    update: {
      name: 'Mayong Circle',
      districtId: morigaon.id,
      hazardScore: 0.71,
      riskClass: 'ORANGE',
    },
    create: {
      id: ZONE_IDS.MAYONG,
      name: 'Mayong Circle',
      districtId: morigaon.id,
      hazardScore: 0.71,
      riskClass: 'ORANGE',
    },
  });

  const laharighat = await prisma.zone.upsert({
    where: { id: ZONE_IDS.LAHARIGHAT },
    update: {
      name: 'Laharighat Circle',
      districtId: morigaon.id,
      hazardScore: 0.48,
      riskClass: 'YELLOW',
    },
    create: {
      id: ZONE_IDS.LAHARIGHAT,
      name: 'Laharighat Circle',
      districtId: morigaon.id,
      hazardScore: 0.48,
      riskClass: 'YELLOW',
    },
  });

  console.log('✓ Zone: Bhuragaon Circle');
  console.log('✓ Zone: Mayong Circle');
  console.log('✓ Zone: Laharighat Circle');

  const settlements = [
    {
      id: SETTLEMENT_IDS.A,
      name: 'Sample Settlement A',
      zoneId: bhuragaon.id,
      population: 4200,
      households: 850,
      areaSqKm: 2.9,
      vulnerabilityScore: 78,
      nearestHospitalKm: 8.5,
      housingStructure: 'KUTCHA',
      lat: 26.25,
      lon: 92.34,
    },
    {
      id: SETTLEMENT_IDS.B,
      name: 'Sample Settlement B',
      zoneId: bhuragaon.id,
      population: 3100,
      households: 620,
      areaSqKm: 3.2,
      vulnerabilityScore: 65,
      nearestHospitalKm: 6.2,
      housingStructure: 'SEMI_PUCCA',
      lat: 26.24,
      lon: 92.36,
    },
    {
      id: SETTLEMENT_IDS.C,
      name: 'Sample Settlement C',
      zoneId: mayong.id,
      population: 5200,
      households: 1040,
      areaSqKm: 3.5,
      vulnerabilityScore: 82,
      nearestHospitalKm: 10.4,
      housingStructure: 'KUTCHA',
      lat: 26.20,
      lon: 92.42,
    },
    {
      id: SETTLEMENT_IDS.D,
      name: 'Sample Settlement D',
      zoneId: mayong.id,
      population: 1800,
      households: 360,
      areaSqKm: 2.7,
      vulnerabilityScore: 54,
      nearestHospitalKm: 5.1,
      housingStructure: 'SEMI_PUCCA',
      lat: 26.18,
      lon: 92.44,
    },
    {
      id: SETTLEMENT_IDS.E,
      name: 'Sample Settlement E',
      zoneId: laharighat.id,
      population: 2700,
      households: 540,
      areaSqKm: 3.8,
      vulnerabilityScore: 48,
      nearestHospitalKm: 4.6,
      housingStructure: 'PUCCA',
      lat: 26.15,
      lon: 92.40,
    },
  ];

  for (const settlement of settlements) {
    const created = await prisma.settlement.upsert({
      where: { id: settlement.id },
      update: settlement,
      create: settlement,
    });

    console.log(`✓ Settlement: ${created.name}`);
  }

  const stateCount = await prisma.state.count();
  const districtCount = await prisma.district.count();
  const zoneCount = await prisma.zone.count();
  const settlementCount = await prisma.settlement.count();

  console.log('\n========================================');
  console.log('SEEDING COMPLETED');
  console.log('========================================');

  console.log(`States       : ${stateCount}`);
  console.log(`Districts    : ${districtCount}`);
  console.log(`Zones        : ${zoneCount}`);
  console.log(`Settlements  : ${settlementCount}`);

  console.log('\nNOTE:');
  console.log('These are development/test records.');
  console.log("Replace them with Rajeshri's actual dataset later.");
  console.log('========================================\n');
}

main()
  .catch((error) => {
    console.error('\n❌ SEEDING FAILED');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });