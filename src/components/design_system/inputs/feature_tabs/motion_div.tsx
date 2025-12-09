import { motion } from "framer-motion"

export const FeatureTabsMotionDiv = () => {
  return (
    <motion.div
      layoutId="feature-tabs-active-background"
      className="absolute inset-0 rounded-[10px] bg-white"
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
    />
  )
}
