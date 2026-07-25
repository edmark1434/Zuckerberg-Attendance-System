
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/ui/navbar";
import {
  QrCode,
  ChartColumn,
  Bell,
  Users,
  ScanLine,
  ChevronRight,
} from "lucide-react";

import { motion } from "motion/react";

const features = [
  {
    title: "Real-Time Attendance Tracker",
    description:
      "Monitor attendance instantly as students check in using their QR codes.",
    icon: ChartColumn,
  },
  {
    title: "QR Code Based Attendance",
    description:
      "Each student receives a unique QR code for fast and secure attendance.",
    icon: QrCode,
  },
  {
    title: "Student Monitoring",
    description:
      "Keep track of student attendance history and classroom participation.",
    icon: Users,
  },
  {
    title: "Attendance Analytics",
    description:
      "Generate attendance summaries and reports for better decision making.",
    icon: ChartColumn,
  },
  {
    title: "Attendance Reminder",
    description:
      "Notify students about attendance schedules and upcoming classes.",
    icon: Bell,
  },
];

const steps = [
  {
    step: "01",
    title: "Login & Download QR",
    description:
      "Students log into their account and download their personal QR Code.",
  },
  {
    step: "02",
    title: "Scan QR Code",
    description:
      "During attendance, students simply scan their QR Code at the classroom entrance.",
  },
  {
    step: "03",
    title: "Attendance Recorded",
    description:
      "The system automatically marks the student as Present and instantly informs the teacher.",
  },
];

// ---- Reusable scroll-reveal wrapper ----
// Animates children in once they scroll into view, then stays put.
// margin pulls the trigger point up so reveals happen a bit before
// the element is fully on screen, which reads as smoother.
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const LandingPage = () => {
  return (
    <div className="bg-white text-black scroll-smooth">
      {/* ================= NAVBAR ================= */}
        <Navbar />
      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative flex min-h-[90vh] items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <motion.img
          src="https://imgs.search.brave.com/vXMp4J3lx_iSVVdtJdRNNp337ZufXvQAM_edjUib5ts/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9ncm91/cC1lbGVtZW50YXJ5/LXNjaG9vbC1raWRz/LXNpdHRpbmctc2No/b29sLXN0ZXBzLTcx/NTMwMzk5LmpwZw"
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-black/65" />

        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            className="max-w-3xl"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: "easeOut" }}>
              <Badge className="bg-sky-500 hover:bg-sky-500">
                School Attendance System
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-6 text-5xl font-bold leading-tight text-white md:text-7xl"
            >
              Smart Attendance
              <span className="block text-sky-400">
                Using QR Technology
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-lg text-gray-300"
            >
              Simplify attendance tracking with QR Codes, real-time
              monitoring, analytics, and automated attendance
              management for schools.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-10 flex gap-4"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg">Get Started</Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="secondary">
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="container mx-auto px-6 py-28"
      >
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="outline">Features</Badge>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-4 text-4xl font-bold"
          >
            Everything You Need
          </motion.h2>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-3 text-muted-foreground"
          >
            Designed to make school attendance simple,
            accurate, and efficient.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full transition-colors hover:border-sky-400 hover:shadow-xl">
                  <CardContent className="p-8">
                    <motion.div
                      whileHover={{ rotate: -6, scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100"
                    >
                      <Icon className="h-7 w-7 text-sky-600" />
                    </motion.div>

                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="bg-slate-50 py-28"
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge variant="outline">How It Works</Badge>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-4 text-4xl font-bold"
            >
              Three Simple Steps
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-3 text-muted-foreground"
            >
              Students can complete attendance in just a few
              seconds.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-20 grid gap-8 lg:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {steps.map((step) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -6 }}
              >
                <Card className="relative h-full border-l-4 border-sky-500">
                  <CardContent className="p-8">
                    <div className="text-5xl font-bold text-sky-500">
                      {step.step}
                    </div>

                    <h3 className="mt-6 text-2xl font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-muted-foreground">
                      {step.description}
                    </p>

                    <motion.div
                      animate={{ x: [0, 6, 0] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                        ease: "easeInOut",
                      }}
                    >
                      <ChevronRight className="mt-8 text-sky-500" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t py-10"
      >
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <h2 className="font-semibold">
            Edu<span className="text-sky-500">Attendance</span>
          </h2>

          <p className="text-sm text-muted-foreground">
            © 2026 School Attendance System. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;