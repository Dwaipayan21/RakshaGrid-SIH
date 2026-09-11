import React, { useState } from 'react'


const DisasterAreaStatusLegend = () => {

  const [open, setOpen] =
    useState(false)


  return (
    <div
      className="
        absolute
        bottom-5
        left-5
        z-[1200]
      "
    >

      {/* =================================================
          COLLAPSED STATE
          ================================================= */}

      {!open && (

        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          aria-label="Open area status"
          className="
            group
            relative
            flex
            items-center
            gap-2
            h-11
            px-3
            rounded-xl
            bg-slate-950/95
            border
            border-slate-700
            shadow-2xl
            backdrop-blur-md
            hover:border-cyan-500/60
            transition-all
          "
        >

          {/* Status indicator */}

          <span
            className="
              w-3
              h-3
              rounded-full
              bg-cyan-400
              shadow-lg
              shadow-cyan-400/30
            "
          />


          <span
            className="
              text-[9px]
              font-mono
              font-black
              tracking-widest
              text-cyan-300
            "
          >
            AREA STATUS
          </span>


          {/* Arrow */}

          <span
            className="
              ml-1
              text-slate-400
              text-sm
              transition-transform
              group-hover:translate-x-0.5
            "
          >
            ↑
          </span>

        </button>

      )}


      {/* =================================================
          EXPANDED STATE
          ================================================= */}

      {open && (

        <div
          className="
            w-[260px]
            rounded-2xl
            overflow-hidden
            bg-slate-950/98
            border
            border-slate-700
            shadow-2xl
            backdrop-blur-xl
          "
        >

          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              px-4
              py-3
              border-b
              border-slate-800
            "
          >

            <div>

              <div
                className="
                  text-[10px]
                  font-mono
                  font-black
                  tracking-widest
                  text-cyan-300
                "
              >
                AREA STATUS
              </div>

              <div
                className="
                  mt-0.5
                  text-[8px]
                  font-mono
                  text-slate-500
                "
              >
                Operational classification
              </div>

            </div>


            {/* Collapse arrow */}

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Collapse area status"
              className="
                flex
                items-center
                justify-center
                w-7
                h-7
                rounded-lg
                bg-slate-900
                border
                border-slate-700
                text-slate-400
                hover:text-white
                hover:border-cyan-500/50
                transition
              "
            >
              ↓
            </button>

          </div>


          {/* Legend */}

          <div
            className="
              p-3
              space-y-1
            "
          >

            {/* RED */}

            <div
              className="
                flex
                items-center
                gap-3
                px-2
                py-2.5
                rounded-lg
                hover:bg-slate-900
              "
            >

              <span
                className="
                  w-3
                  h-3
                  rounded-full
                  bg-red-500
                  flex-shrink-0
                "
              />

              <div>

                <div
                  className="
                    text-[10px]
                    font-mono
                    font-black
                    text-red-400
                  "
                >
                  HIGH RISK / DANGER
                </div>

                <div
                  className="
                    text-[8px]
                    font-mono
                    text-slate-500
                  "
                >
                  Hazardous area
                </div>

              </div>

            </div>


            {/* ORANGE */}

            <div
              className="
                flex
                items-center
                gap-3
                px-2
                py-2.5
                rounded-lg
                hover:bg-slate-900
              "
            >

              <span
                className="
                  w-3
                  h-3
                  rounded-full
                  bg-orange-400
                  flex-shrink-0
                "
              />

              <div>

                <div
                  className="
                    text-[10px]
                    font-mono
                    font-black
                    text-orange-400
                  "
                >
                  AT RISK
                </div>

                <div
                  className="
                    text-[8px]
                    font-mono
                    text-slate-500
                  "
                >
                  May be affected
                </div>

              </div>

            </div>


            {/* GREEN */}

            <div
              className="
                flex
                items-center
                gap-3
                px-2
                py-2.5
                rounded-lg
                hover:bg-slate-900
              "
            >

              <span
                className="
                  w-3
                  h-3
                  rounded-full
                  bg-emerald-400
                  flex-shrink-0
                "
              />

              <div>

                <div
                  className="
                    text-[10px]
                    font-mono
                    font-black
                    text-emerald-400
                  "
                >
                  SAFE ZONE
                </div>

                <div
                  className="
                    text-[8px]
                    font-mono
                    text-slate-500
                  "
                >
                  Relatively safe
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


export default DisasterAreaStatusLegend