const express = require('express');
const { PrismaClient, Prisma } = require('@prisma/client');

const router = express.Router();

const prisma = new PrismaClient();


// =========================================================
// GET CENSUS VILLAGES
// Supports:
// ?page=1
// ?limit=50
// ?district=Barpeta
// ?subdistrict=Baghbor
// ?search=Chachara
// =========================================================

router.get('/', async (req, res) => {

  try {

    // -----------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 50,
        1
      ),
      100
    );

    const offset = (page - 1) * limit;


    // -----------------------------------------------------
    // FILTERS
    // -----------------------------------------------------

    const district =
      req.query.district?.trim() || null;

    const subdistrict =
      req.query.subdistrict?.trim() || null;

    const search =
      req.query.search?.trim() || null;


    // -----------------------------------------------------
    // WHERE CONDITIONS
    // -----------------------------------------------------

    const conditions = [];


    if (district) {

      conditions.push(
        Prisma.sql`district = ${district}`
      );

    }


    if (subdistrict) {

      conditions.push(
        Prisma.sql`subdistrict_name = ${subdistrict}`
      );

    }


    if (search) {

      const searchPattern = `%${search}%`;

      conditions.push(
        Prisma.sql`(
          village_name ILIKE ${searchPattern}
          OR census_village_code ILIKE ${searchPattern}
        )`
      );

    }


    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(
            conditions,
            ' AND '
          )}`
        : Prisma.empty;


    // -----------------------------------------------------
    // TOTAL COUNT
    // -----------------------------------------------------

    const countResult = await prisma.$queryRaw`

      SELECT
        COUNT(*)::int AS total

      FROM census_villages

      ${whereClause};

    `;


    const total = countResult[0].total;


    // -----------------------------------------------------
    // FETCH PAGINATED VILLAGES
    // -----------------------------------------------------

    const villages = await prisma.$queryRaw`

      SELECT

        id,

        census_village_code,

        village_name,

        state,

        district,

        subdistrict,

        subdistrict_name,

        rural_urban,

        households,

        population,

        created_at,

        updated_at

      FROM census_villages

      ${whereClause}

      ORDER BY
        district ASC,
        subdistrict_name ASC,
        village_name ASC

      LIMIT ${limit}
      OFFSET ${offset};

    `;


    // -----------------------------------------------------
    // PAGINATION METADATA
    // -----------------------------------------------------

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / limit);


    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.json({

      success: true,

      count: villages.length,

      total,

      page,

      limit,

      totalPages,

      filters: {

        district,

        subdistrict,

        search,

      },

      data: villages,

    });

  } catch (error) {

    console.error(
      'Failed to fetch Census villages:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to fetch Census village data.',

      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,

    });

  }

});


// =========================================================
// GET CENSUS SUMMARY FOR AN EVACUATION AREA
// =========================================================

router.get('/summary', async (req, res) => {

  try {

    const district =
      req.query.district?.trim();

    const subdistrict =
      req.query.subdistrict?.trim();


    // -----------------------------------------------------
    // VALIDATE PARAMETERS
    // -----------------------------------------------------

    if (!district || !subdistrict) {

      return res.status(400).json({

        success: false,

        message:
          'district and subdistrict are required.',

      });

    }


    // -----------------------------------------------------
    // FETCH CENSUS SUMMARY
    // -----------------------------------------------------

    const result = await prisma.$queryRaw`

      SELECT

        district,

        subdistrict_name,

        COUNT(*)::int AS village_count,

        COALESCE(
          SUM(population),
          0
        )::bigint AS population,

        COALESCE(
          SUM(households),
          0
        )::bigint AS households

      FROM census_villages

      WHERE

        district = ${district}

        AND

        subdistrict_name = ${subdistrict}

      GROUP BY

        district,

        subdistrict_name;

    `;


    // -----------------------------------------------------
    // NO DATA
    // -----------------------------------------------------

    if (result.length === 0) {

      return res.json({

        success: true,

        data: null,

      });

    }


    const summary = result[0];


    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.json({

      success: true,

      data: {

        district:
          summary.district,

        subdistrict:
          summary.subdistrict_name,

        villageCount:
          Number(
            summary.village_count
          ),

        population:
          Number(
            summary.population
          ),

        households:
          Number(
            summary.households
          ),

      },

    });

  } catch (error) {

    console.error(
      'Failed to fetch Census summary:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to fetch Census summary.',

      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,

    });

  }

});


// =========================================================
// GET SINGLE VILLAGE
// =========================================================

router.get('/:id', async (req, res) => {

  try {

    const { id } = req.params;


    const villages = await prisma.$queryRaw`

      SELECT

        id,

        census_village_code,

        village_name,

        state,

        district,

        subdistrict,

        subdistrict_name,

        rural_urban,

        households,

        population,

        created_at,

        updated_at

      FROM census_villages

      WHERE id = ${id}

      LIMIT 1;

    `;


    // -----------------------------------------------------
    // VILLAGE NOT FOUND
    // -----------------------------------------------------

    if (villages.length === 0) {

      return res.status(404).json({

        success: false,

        message:
          'Census village not found.',

      });

    }


    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.json({

      success: true,

      data: villages[0],

    });

  } catch (error) {

    console.error(
      'Failed to fetch Census village:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to fetch Census village.',

      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,

    });

  }

});


module.exports = router;