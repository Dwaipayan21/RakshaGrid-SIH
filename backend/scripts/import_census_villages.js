const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CSV_PATH = path.resolve(
  __dirname,
  '../../data/processed/village_master_enriched.csv'
);


// =========================================================
// CSV PARSER
// =========================================================

function parseCSVLine(line) {

  const values = [];

  let current = '';

  let insideQuotes = false;


  for (let i = 0; i < line.length; i++) {

    const char = line[i];


    if (char === '"') {

      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {

        current += '"';

        i++;

      } else {

        insideQuotes =
          !insideQuotes;

      }

      continue;
    }


    if (
      char === ',' &&
      !insideQuotes
    ) {

      values.push(current);

      current = '';

    } else {

      current += char;

    }

  }


  values.push(current);

  return values;
}


// =========================================================
// CLEAN CSV VALUE
// =========================================================

function clean(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return '';

  }


  return String(value)
    .trim()
    .replace(/^"(.*)"$/, '$1');

}


// =========================================================
// MAIN
// =========================================================

async function main() {

  console.log('');

  console.log(
    '========================================'
  );

  console.log(
    'RAKSHA GRID CENSUS DATABASE IMPORT'
  );

  console.log(
    '========================================'
  );

  console.log('');


  // =======================================================
  // CHECK CSV
  // =======================================================

  if (!fs.existsSync(CSV_PATH)) {

    throw new Error(
      `Census CSV not found:\n${CSV_PATH}`
    );

  }


  console.log(
    'CSV:',
    CSV_PATH
  );


  // =======================================================
  // READ CSV
  // =======================================================

  const text =
    fs.readFileSync(
      CSV_PATH,
      'utf8'
    );


  const lines =
    text
      .split(/\r?\n/)
      .filter(
        line =>
          line.trim().length > 0
      );


  if (lines.length < 2) {

    throw new Error(
      'CSV contains no data rows.'
    );

  }


  // =======================================================
  // READ HEADERS
  // =======================================================

  const headers =
    parseCSVLine(lines[0])
      .map(clean);


  const index = {};


  headers.forEach(
    (header, position) => {

      index[header] =
        position;

    }
  );


  // =======================================================
  // REQUIRED COLUMNS
  // =======================================================

  const requiredColumns = [

    'state',

    'district',

    'subdistrict',

    'census_village_code',

    'village_name',

    'rural_urban',

    'households',

    'population',

    'rakshagrid_village_id',

  ];


  for (
    const column
    of requiredColumns
  ) {

    if (
      index[column] === undefined
    ) {

      throw new Error(
        `Missing CSV column: ${column}`
      );

    }

  }


  console.log(
    'CSV headers validated successfully.'
  );


  // =======================================================
  // CREATE TABLE
  // =======================================================

  console.log('');

  console.log(
    'Creating census_villages table...'
  );


  await prisma.$executeRawUnsafe(`

    CREATE TABLE IF NOT EXISTS census_villages (

      id TEXT PRIMARY KEY,

      census_village_code TEXT NOT NULL UNIQUE,

      village_name TEXT NOT NULL,

      state TEXT NOT NULL,

      district TEXT NOT NULL,

      subdistrict TEXT,

      rural_urban TEXT,

      households INTEGER NOT NULL DEFAULT 0,

      population INTEGER NOT NULL DEFAULT 0,

      created_at TIMESTAMP(3)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP(3)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP

    );

  `);


  console.log(
    'Table ready.'
  );


  // =======================================================
  // IMPORT
  // =======================================================

  let imported = 0;

  let skipped = 0;


  console.log('');

  console.log(
    'Importing Census village records...'
  );

  console.log('');


  for (
    let lineNumber = 1;
    lineNumber < lines.length;
    lineNumber++
  ) {

    const row =
      parseCSVLine(
        lines[lineNumber]
      );


    // =====================================================
    // EXTRACT VALUES
    // =====================================================

    const villageId =
      clean(
        row[
          index[
            'rakshagrid_village_id'
          ]
        ]
      );


    const censusCode =
      clean(
        row[
          index[
            'census_village_code'
          ]
        ]
      );


    const villageName =
      clean(
        row[
          index[
            'village_name'
          ]
        ]
      );


    const state =
      clean(
        row[
          index[
            'state'
          ]
        ]
      );


    const district =
      clean(
        row[
          index[
            'district'
          ]
        ]
      );


    const subdistrict =
      clean(
        row[
          index[
            'subdistrict'
          ]
        ]
      );


    const ruralUrban =
      clean(
        row[
          index[
            'rural_urban'
          ]
        ]
      );


    const households =
      Number(
        clean(
          row[
            index[
              'households'
            ]
          ]
        )
      ) || 0;


    const population =
      Number(
        clean(
          row[
            index[
              'population'
            ]
          ]
        )
      ) || 0;


    // =====================================================
    // VALIDATE ROW
    // =====================================================

    if (
      !villageId ||
      !censusCode ||
      !villageName
    ) {

      skipped++;

      console.warn(
        `Skipping invalid row ${lineNumber + 1}`
      );

      continue;

    }


    // =====================================================
    // UPSERT
    // =====================================================

    await prisma.$executeRaw`

      INSERT INTO census_villages (

        id,

        census_village_code,

        village_name,

        state,

        district,

        subdistrict,

        rural_urban,

        households,

        population

      )

      VALUES (

        ${villageId},

        ${censusCode},

        ${villageName},

        ${state},

        ${district},

        ${subdistrict},

        ${ruralUrban},

        ${households},

        ${population}

      )

      ON CONFLICT (
        census_village_code
      )

      DO UPDATE SET

        village_name =
          EXCLUDED.village_name,

        state =
          EXCLUDED.state,

        district =
          EXCLUDED.district,

        subdistrict =
          EXCLUDED.subdistrict,

        rural_urban =
          EXCLUDED.rural_urban,

        households =
          EXCLUDED.households,

        population =
          EXCLUDED.population,

        updated_at =
          CURRENT_TIMESTAMP;

    `;


    imported++;


    // =====================================================
    // PROGRESS
    // =====================================================

    if (
      imported % 250 === 0
    ) {

      console.log(
        `Imported ${imported} villages...`
      );

    }

  }


  // =======================================================
  // VERIFY DATABASE COUNT
  // =======================================================

  const result =
    await prisma.$queryRaw`

      SELECT
        COUNT(*)::int AS count

      FROM census_villages;

    `;


  const databaseCount =
    Number(
      result[0].count
    );


  // =======================================================
  // SUMMARY
  // =======================================================

  console.log('');

  console.log(
    '========================================'
  );

  console.log(
    `Imported/updated: ${imported}`
  );

  console.log(
    `Skipped: ${skipped}`
  );

  console.log(
    `Database count: ${databaseCount}`
  );

  console.log(
    '========================================'
  );

  console.log('');


  // =======================================================
  // FINAL VALIDATION
  // =======================================================

  if (
    databaseCount !== 3754
  ) {

    throw new Error(

      `Expected 3754 villages, ` +
      `found ${databaseCount}`

    );

  }


  console.log(
    'SUCCESS: All 3,754 Census villages are in PostgreSQL.'
  );

}


// =========================================================
// ERROR HANDLING
// =========================================================

main()

  .catch(error => {

    console.error('');

    console.error(
      'DATABASE IMPORT FAILED'
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