import { motion } from "framer-motion"
import { Address } from "viem"

type FeatureTabsMotionDivProps = {
  marketAddress: Address | string
}

export const FeatureTabsMotionDiv = ({ marketAddress }: FeatureTabsMotionDivProps) => {
  return (
    <motion.div
      layoutId={`feature-tabs-motion-div-${marketAddress}`}
      layout="position"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      style={{ y: 0 }}
      className="pointer-events-none absolute inset-0 rounded-[10px] bg-white"
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    />
  )
}
