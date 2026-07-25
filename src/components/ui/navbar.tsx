import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
const Navbar = () =>{
    return (
        <>
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur"
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <h2 className="text-xl font-bold">
              Zuckerberg<span className="text-sky-500">Attendance</span>
            </h2>

            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <NavigationMenuLink href="#home">
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="#features">
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="#how-it-works">
                    How it Works
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => (window.location.href = "/login")}>
                Student Login
              </Button>
            </motion.div>
          </div>
        </motion.header>
        </>
    )
}
export default Navbar;