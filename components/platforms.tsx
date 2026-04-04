"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, UserCheck, Calendar } from "lucide-react";
import { motion } from "motion/react";

const Admissions = () => {
  const steps = [
    {
      icon: FileText,
      title: "Submit Application",
      description:
        "Complete our online application form with required documents and student information.",
    },
    {
      icon: Calendar,
      title: "Schedule Visit",
      description:
        "Tour our campus and meet our dedicated faculty and administrative team.",
    },
    {
      icon: UserCheck,
      title: "Student Assessment",
      description:
        "Participate in a brief assessment to help us understand your child's learning needs.",
    },
    {
      icon: CheckCircle2,
      title: "Enrollment",
      description:
        "Receive admission decision and complete enrollment process to join our community.",
    },
  ];

  return (
    <section
      id="admissions"
      className="bg-background relative overflow-hidden py-32"
    >
      {/* Background Elements */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.05 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="bg-primary absolute top-1/4 left-0 h-96 w-96 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.05 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
        className="bg-accent absolute right-0 bottom-1/4 h-96 w-96 rounded-full blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="mb-6 text-6xl font-bold tracking-tighter md:text-7xl lg:text-8xl">
            <span className="text-gradient">Admissions</span> Process
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed font-light md:text-2xl">
            Join the MSSG Academy family. Our admissions process is designed to
            be simple and welcoming.
          </p>
        </motion.div>

        <div className="mb-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group text-center"
            >
              <div className="relative mb-8">
                <div className="from-accent/20 to-primary/20 mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <step.icon className="text-accent h-14 w-14" />
                </div>
                <div className="bg-primary absolute -top-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-primary mb-3 text-2xl font-bold tracking-tight md:text-3xl">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="from-primary via-accent to-primary absolute inset-0 animate-pulse rounded-[3rem] bg-gradient-to-r opacity-30 blur-3xl" />
          <div className="from-primary via-primary-glow to-accent relative overflow-hidden rounded-[3rem] bg-gradient-to-br p-12 md:p-20">
            <div className="animate-float absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div
              className="animate-float absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              style={{ animationDelay: "3s" }}
            />
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <h3 className="text-primary-foreground mb-8 text-5xl font-bold tracking-tighter md:text-6xl">
                Ready to Get Started?
              </h3>
              <p className="text-primary-foreground/90 mb-12 text-xl leading-relaxed font-light md:text-2xl">
                Enrollment for the upcoming academic year is now open. Contact
                us today to schedule a campus tour or begin your application.
              </p>
              <div className="flex flex-col justify-center gap-6 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="text-primary rounded-2xl bg-white px-10 py-7 text-xl font-bold transition-all duration-300 hover:scale-105 hover:bg-white/90"
                >
                  <a href="#contact">Contact Admissions</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="glass rounded-2xl px-10 py-7 text-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/20"
                >
                  <a href="#contact">Schedule a Tour</a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Admissions;
