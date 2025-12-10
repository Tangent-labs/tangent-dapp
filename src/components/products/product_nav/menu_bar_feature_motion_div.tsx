import { motion } from "framer-motion"

export const MenuBarFeatureMotionDiv = () => {
  return (
    <motion.div
      layoutId="header-menu-motion-div"
      className="absolute inset-0 rounded-lg bg-white/10"
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
    />
  )
}
