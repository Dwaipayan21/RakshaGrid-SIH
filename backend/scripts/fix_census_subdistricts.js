const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


// =========================================================
// OFFICIAL CENSUS 2011 SUBDISTRICT MAPPING
// Assam pilot districts
// =========================================================

const SUBDISTRICT_MAP = {

  // =======================================================
  // BARPETA — DISTRICT CODE 303
  // =======================================================

  '2018': {
    district: 'Barpeta',
    name: 'Barnagar (Pt)',
  },

  '2019': {
    district: 'Barpeta',
    name: 'Kalgachia',
  },

  '2020': {
    district: 'Barpeta',
    name: 'Baghbor',
  },

  '2021': {
    district: 'Barpeta',
    name: 'Chenga',
  },

  '2022': {
    district: 'Barpeta',
    name: 'Barpeta',
  },

  '2023': {
    district: 'Barpeta',
    name: 'Sarthebari',
  },

  '2024': {
    district: 'Barpeta',
    name: 'Bajali (Pt)',
  },

  '2025': {
    district: 'Barpeta',
    name: 'Sarupeta (Pt)',
  },

  '2140': {
    district: 'Barpeta',
    name: 'Jalah (Pt)',
  },


  // =======================================================
  // MORIGAON — DISTRICT CODE 304
  // =======================================================

  '2026': {
    district: 'Morigaon',
    name: 'Mayong',
  },

  '2027': {
    district: 'Morigaon',
    name: 'Bhuragaon',
  },

  '2028': {
    district: 'Morigaon',
    name: 'Laharighat',
  },

  '2029': {
    district: 'Morigaon',
    name: 'Marigaon',
  },

  '2030': {
    district: 'Morigaon',
    name: 'Mikirbheta',
  },


  // =======================================================
  // NAGAON — DISTRICT CODE 305
  // =======================================================

  '2031': {
    district: 'Nagaon',
    name: 'Kaliabor',
  },

  '2032': {
    district: 'Nagaon',
    name: 'Samaguri',
  },

  '2033': {
    district: 'Nagaon',
    name: 'Rupahi',
  },

  '2034': {
    district: 'Nagaon',
    name: 'Dhing',
  },

  '2035': {
    district: 'Nagaon',
    name: 'Nagaon',
  },

  '2036': {
    district: 'Nagaon',
    name: 'Raha',
  },

  '2037': {
    district: 'Nagaon',
    name: 'Kampur',
  },

  '2038': {
    district: 'Nagaon',
    name: 'Hojai',
  },

  '2039': {
    district: 'Nagaon',
    name: 'Doboka',
  },

  '2040': {
    district: 'Nagaon',
    name: 'Lanka',
  },


  // =======================================================
  // SIVASAGAR — DISTRICT CODE 311
  // =======================================================

  '2070': {
    district: 'Sivasagar',
    name: 'Dimow',
  },

  '2071': {
    district: 'Sivasagar',
    name: 'Sibsagar',
  },

  '2072': {
    district: 'Sivasagar',
    name: 'Amguri',
  },

  '2073': {
    district: 'Sivasagar',
    name: 'Nazira',
  },

  '2074': {
    district: 'Sivasagar',
    name: 'Sonari',
  },

  '2075': {
    district: 'Sivasagar',
    name: 'Mahmora',
  },

};


// =========================================================
// MAIN
// =========================================================

async function main() {

  console.log('');

  console.log(
    '========================================'
  );

  console.log(
    'RAKSHA GRID SUBDISTRICT MAPPING'
  );

  console.log(
    '========================================'
  );

  console.log('');


  // =======================================================
  // ADD HUMAN-READABLE COLUMN
  // =======================================================

  console.log(
    'Checking subdistrict_name column...'
  );


  await prisma.$executeRawUnsafe(`

    ALTER TABLE census_villages

    ADD COLUMN IF NOT EXISTS
      subdistrict_name TEXT;

  `);


  console.log(
    'subdistrict_name column ready.'
  );


  // =======================================================
  // UPDATE EACH SUBDISTRICT
  // =======================================================

  let updated = 0;


  for (
    const [code, entry]
    of Object.entries(
      SUBDISTRICT_MAP
    )
  ) {

    const result =
      await prisma.$executeRaw`

        UPDATE census_villages

        SET
          subdistrict_name =
            ${entry.name}

        WHERE
          district =
            ${entry.district}

          AND

          subdistrict =
            ${code};

      `;


    console.log(
      `${entry.district.padEnd(12)} ` +
      `${code.padEnd(6)} → ` +
      `${entry.name.padEnd(20)} ` +
      `(${result} rows)`
    );


    updated += Number(result);

  }


  // =======================================================
  // CHECK FOR UNMAPPED RECORDS
  // =======================================================

  const unmapped =
    await prisma.$queryRaw`

      SELECT

        district,

        subdistrict,

        COUNT(*)::int AS villages

      FROM census_villages

      WHERE
        subdistrict_name IS NULL

      GROUP BY
        district,
        subdistrict

      ORDER BY
        district,
        subdistrict;

    `;


  console.log('');

  console.log(
    '========================================'
  );

  console.log(
    `Rows updated: ${updated}`
  );

  console.log(
    `Unmapped combinations: ${unmapped.length}`
  );

  console.log(
    '========================================'
  );


  // =======================================================
  // DISPLAY UNMAPPED DATA
  // =======================================================

  if (
    unmapped.length > 0
  ) {

    console.log('');

    console.log(
      'UNMAPPED SUBDISTRICTS:'
    );

    console.table(
      unmapped
    );

  }


  // =======================================================
  // TOTAL VILLAGE COUNT
  // =======================================================

  const total =
    await prisma.$queryRaw`

      SELECT
        COUNT(*)::int AS count

      FROM census_villages;

    `;


  console.log('');

  console.log(
    `Total villages: ${total[0].count}`
  );


  if (
    Number(total[0].count) !== 3754
  ) {

    throw new Error(
      `Expected 3754 villages, ` +
      `found ${total[0].count}`
    );

  }


  // =======================================================
  // FINAL STATUS
  // =======================================================

  if (
    unmapped.length === 0
  ) {

    console.log('');

    console.log(
      'SUCCESS: All Census subdistricts mapped.'
    );

  } else {

    console.log('');

    console.log(
      'WARNING: Some subdistricts remain unmapped.'
    );

  }


  console.log('');

}


// =========================================================
// ERROR HANDLING
// =========================================================

main()

  .catch(error => {

    console.error('');

    console.error(
      'SUBDISTRICT MAPPING FAILED'
    );

    console.error('');

    console.error(
      error.message || error
    );

    console.error('');

    process.exitCode = 1;

  })

  .finally(async () => {

    await prisma.$disconnect();

  });