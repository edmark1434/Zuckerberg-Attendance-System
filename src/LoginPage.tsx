import { motion } from "motion/react"
import { LoginForm } from "@/components/login-form"

import Navbar from "@/components/ui/navbar";
export default function LoginPage() {
  return (
      <div className="bg-white text-black scroll-smooth">
        <Navbar />
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">

        <motion.div
          className="w-full max-w-sm md:max-w-4xl"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>

  )
}