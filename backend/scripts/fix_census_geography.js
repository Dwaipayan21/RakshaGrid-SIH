const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  console.log('');
  console.log('========================================');
  console.log('RAKSHA GRID CENSUS GEOGRAPHY FIX');
  console.log('========================================');
  console.log('');

  console.log('Updating state name...');

  await prisma.$executeRaw`
    UPDATE census_villages
    SET state = 'Assam'
    WHERE state = '18';
  `;


  console.log('Updating district names...');

  await prisma.$executeRaw`
    UPDATE census_villages
    SET district = 'Barpeta'
    WHERE district = '303';
  `;


  await prisma.$executeRaw`
    UPDATE census_villages
    SET district = 'Morigaon'
    WHERE district = '304';
  `;


  await prisma.$executeRaw`
    UPDATE census_villages
    SET district = 'Nagaon'
    WHERE district = '305';
  `;


  await prisma.$executeRaw`
    UPDATE census_villages
    SET district = 'Sivasagar'
    WHERE district = '311';
  `;


  console.log('');
  console.log('Geography update completed.');
  console.log('');


  // =======================================================
  // VERIFY
  // =======================================================

  const result = await prisma.$queryRaw`

    SELECT
      state,
      district,
      COUNT(*)::int AS villages

    FROM census_villages

    GROUP BY
      state,
      district

    ORDER BY
      district;

  `;


  console.log(
    'District distribution:'
  );

  console.table(result);


  // =======================================================
  // TOTAL
  // =======================================================

  const total = await prisma.$queryRaw`

    SELECT
      COUNT(*)::int AS count

    FROM census_villages;

  `;


  console.log(
    `Total villages: ${total[0].count}`
  );


  if (
    Number(total[0].count) !== 3754
  ) {

    throw new Error(
      `Expected 3754 villages, found ${total[0].count}`
    );

  }


  console.log('');
  console.log(
    'SUCCESS: Census geography corrected.'
  );
  console.log('');

}


main()

  .catch(error => {

    console.error('');
    console.error(
      'GEOGRAPHY UPDATE FAILED'
    );
    console.error('');
    console.error(
      error.message || error
    );

    process.exitCode = 1;

  })

  .finally(async () => {

    await prisma.$disconnect();

  });