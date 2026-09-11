import React, {
  useEffect,
  useState,
} from 'react'

import {
  fetchVillageData,
} from '../../services/villageData.service'


const VillageDataPanel = () => {

  // =========================================================
  // VILLAGE DATA
  // =========================================================

  const [
    villages,
    setVillages,
  ] = useState([])


  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState(null)


  // =========================================================
  // SEARCH
  // =========================================================

  const [
    searchInput,
    setSearchInput,
  ] = useState('')


  const [
    search,
    setSearch,
  ] = useState('')


  // =========================================================
  // PAGINATION
  // =========================================================

  const [
    page,
    setPage,
  ] = useState(1)


  const [
    total,
    setTotal,
  ] = useState(0)


  const [
    totalPages,
    setTotalPages,
  ] = useState(1)


  const limit = 100


  // =========================================================
  // DEBOUNCED SEARCH
  // =========================================================

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setPage(1)

        setSearch(
          searchInput.trim()
        )

      }, 300)


    return () => {
      clearTimeout(timer)
    }

  }, [
    searchInput,
  ])


  // =========================================================
  // FETCH VILLAGE DATA
  // =========================================================

  useEffect(() => {

    let cancelled = false


    const loadVillages = async () => {

      try {

        setLoading(true)

        setError(null)


        const result =
          await fetchVillageData({
            page,
            limit,
            search,
          })


        if (cancelled) {
          return
        }


        setVillages(
          result.data || []
        )


        setTotal(
          Number(result.total || 0)
        )


        setTotalPages(
          Number(result.totalPages || 1)
        )


      } catch (err) {

        if (cancelled) {
          return
        }


        console.error(
          'Village data error:',
          err
        )


        setError(
          err.message ||
          'Failed to load village data.'
        )


        setVillages([])

        setTotal(0)

        setTotalPages(1)


      } finally {

        if (!cancelled) {
          setLoading(false)
        }

      }

    }


    loadVillages()


    return () => {
      cancelled = true
    }

  }, [
    page,
    search,
  ])


  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  const goToPreviousPage = () => {

    setPage(
      (previous) =>
        Math.max(
          previous - 1,
          1
        )
    )

  }


  const goToNextPage = () => {

    setPage(
      (previous) =>
        Math.min(
          previous + 1,
          totalPages
        )
    )

  }


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (
    loading &&
    villages.length === 0
  ) {

    return (
      <div className="p-4 text-cyan-300 font-mono text-sm">
        LOADING CENSUS VILLAGE DATA...
      </div>
    )

  }


  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {

    return (
      <div className="p-4 text-red-400 font-mono text-sm">
        VILLAGE DATA ERROR: {error}
      </div>
    )

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="p-4">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-4">

        <div className="text-xs font-mono text-cyan-300">
          CENSUS VILLAGE DATABASE
        </div>


        <div className="text-2xl font-bold text-white">
          {total.toLocaleString()}
        </div>


        <div className="text-xs text-slate-400">
          Real village records available from backend
        </div>

      </div>


      {/* =====================================================
          SEARCH
          ===================================================== */}

      <input
        type="text"
        value={searchInput}
        onChange={(event) => {

          setSearchInput(
            event.target.value
          )

        }}
        placeholder="Search village, district, subdistrict or census code..."
        className="
          w-full
          mb-4
          px-3
          py-2
          rounded-lg
          bg-slate-900
          border
          border-slate-700
          text-white
          text-sm
          outline-none
          focus:border-cyan-400
          focus:ring-1
          focus:ring-cyan-400/30
        "
      />


      {/* =====================================================
          RESULT INFORMATION
          ===================================================== */}

      <div className="mb-3 flex items-center justify-between">

        <div className="text-xs font-mono text-slate-500">

          {search ? (

            <>
              {total.toLocaleString()}
              {' '}
              matching records
            </>

          ) : (

            <>
              Showing village records
              {' · '}
              {total.toLocaleString()}
              {' total'}
            </>

          )}

        </div>


        {loading && (

          <div className="text-[10px] font-mono text-cyan-400">
            UPDATING...
          </div>

        )}

      </div>


      {/* =====================================================
          VILLAGE LIST
          ===================================================== */}

      <div className="max-h-[500px] overflow-auto">

        {!loading &&
          villages.length === 0 && (

            <div
              className="
                h-64
                flex
                items-center
                justify-center
                text-center
                text-slate-500
                font-mono
                text-sm
              "
            >

              NO CENSUS RECORDS FOUND

            </div>

          )}


        {villages.map(
          (village) => (

            <div
              key={village.id}
              className="
                p-3
                mb-2
                rounded-lg
                bg-slate-900
                border
                border-slate-800
                hover:border-cyan-500/30
                transition-colors
              "
            >

              {/* =================================================
                  VILLAGE NAME
                  ================================================= */}

              <div className="text-white font-semibold">

                {village.village_name}

              </div>


              {/* =================================================
                  GEOGRAPHY
                  ================================================= */}

              <div className="text-xs text-slate-400 mt-1">

                {village.district}

                {' · '}

                {village.subdistrict_name ||
                  village.subdistrict ||
                  'Unknown Subdistrict'}

              </div>


              {/* =================================================
                  SUBDISTRICT CODE
                  ================================================= */}

              <div className="text-xs text-slate-500 mt-1">

                Subdistrict Code:{' '}

                {village.subdistrict || '—'}

              </div>


              {/* =================================================
                  CENSUS CODE
                  ================================================= */}

              <div className="text-xs text-slate-500 mt-1">

                Census Code:{' '}

                {village.census_village_code}

              </div>


              {/* =================================================
                  POPULATION / HOUSEHOLDS
                  ================================================= */}

              <div className="flex gap-4 mt-2 text-xs">

                <span className="text-cyan-300">

                  Population:{' '}

                  {Number(
                    village.population || 0
                  ).toLocaleString()}

                </span>


                <span className="text-slate-300">

                  HH:{' '}

                  {Number(
                    village.households || 0
                  ).toLocaleString()}

                </span>

              </div>

            </div>

          )
        )}

      </div>


      {/* =====================================================
          PAGINATION
          ===================================================== */}

      <div
        className="
          mt-4
          pt-3
          border-t
          border-slate-800
          flex
          items-center
          justify-between
        "
      >

        {/* ===================================================
            PREVIOUS
            =================================================== */}

        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={
            page <= 1 ||
            loading
          }
          className="
            px-3
            py-2
            rounded-lg
            border
            border-slate-700
            bg-slate-900
            text-xs
            font-mono
            text-slate-400
            hover:text-cyan-300
            hover:border-cyan-500/40
            disabled:opacity-30
            disabled:cursor-not-allowed
            transition
          "
        >

          ← PREVIOUS

        </button>


        {/* ===================================================
            PAGE INDICATOR
            =================================================== */}

        <div
          className="
            text-xs
            font-mono
            text-slate-500
          "
        >

          PAGE{' '}

          <span className="text-cyan-300">
            {page}
          </span>

          {' / '}

          <span className="text-slate-300">
            {totalPages}
          </span>

        </div>


        {/* ===================================================
            NEXT
            =================================================== */}

        <button
          type="button"
          onClick={goToNextPage}
          disabled={
            page >= totalPages ||
            loading
          }
          className="
            px-3
            py-2
            rounded-lg
            border
            border-slate-700
            bg-slate-900
            text-xs
            font-mono
            text-slate-400
            hover:text-cyan-300
            hover:border-cyan-500/40
            disabled:opacity-30
            disabled:cursor-not-allowed
            transition
          "
        >

          NEXT →

        </button>

      </div>

    </div>

  )

}


export default VillageDataPanel