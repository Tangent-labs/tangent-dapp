"use client"

import { motion, useReducedMotion } from "framer-motion"

type RollingNumberProps = {
  value: number
  format: (value: number) => string
}

// Two laps of 0-9 stacked: every digit spins at least one full lap before landing, so all digits roll visibly
const REEL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const CELL_PERCENT = 100 / REEL.length

const ROLL_DURATION = 1.1
// Ease-out quart: quick start, long soft landing (no abrupt stop)
const ROLL_EASE = [0.165, 0.84, 0.44, 1] as const
// Each digit starts a little after the one on its right, so the number "cascades"
const ROLL_STAGGER = 0.03
const ROLL_MAX_DELAY = 0.3

// Position of a digit on the reel: the second lap, so it can roll forward or back to any digit
const getReelY = (digit: number) => `${-(digit + 10) * CELL_PERCENT}%`

type ReelProps = {
  digit: number
  delay: number
}

// One digit: a vertical reel that slides to the wanted digit (like an odometer). It stays in place once landed, so the
// number never swaps to another element (no jump, no change of spacing) when the roll ends.
// The reel is inline and sized by an invisible copy of the digit, so it has the same line box and baseline as the
// surrounding text. Every cell of the reel has exactly the size of that box (same line height, same vertical padding),
// so a landed digit sits where the plain text would. It is clipped with clip-path (not overflow, which would move the
// baseline); the padding (cancelled by a negative margin) keeps the top and bottom of the glyphs from being cut.
const Reel = ({ digit, delay }: ReelProps) => (
  <span className="relative -my-[0.14em] inline-block py-[0.14em] [clip-path:inset(0)]" aria-hidden>
    <span className="invisible">{digit}</span>

    <motion.span
      className="absolute inset-x-0 top-0 flex flex-col"
      style={{ height: `${REEL.length * 100}%` }}
      initial={{ y: "0%" }}
      animate={{ y: getReelY(digit) }}
      transition={{ duration: ROLL_DURATION, ease: ROLL_EASE, delay }}
    >
      {REEL.map((d, index) => (
        <span key={index} className="block h-[calc(100%/20)] py-[0.14em] text-center leading-[inherit]">
          {d}
        </span>
      ))}
    </motion.span>
  </span>
)

const isDigit = (character: string) => /\d/.test(character)

// Formats the value, then rolls every digit from 0 to its place on load and from the old digit to the new one on update
export const RollingNumber = ({ value, format }: RollingNumberProps) => {
  const shouldReduceMotion = useReducedMotion()

  const text = format(value)

  if (shouldReduceMotion) return <>{text}</>

  const characters = text.split("")

  return (
    <span>
      <span className="sr-only">{text}</span>

      {characters.map((character, index) => {
        // Keys and delays count from the right so columns keep their identity when the number gets longer
        const fromRight = characters.length - 1 - index

        if (!isDigit(character)) {
          return (
            <span key={fromRight} aria-hidden>
              {character}
            </span>
          )
        }

        return <Reel key={fromRight} digit={Number(character)} delay={Math.min(fromRight * ROLL_STAGGER, ROLL_MAX_DELAY)} />
      })}
    </span>
  )
}
