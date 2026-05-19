"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Package, IndianRupee, Bell, Star, Zap } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Notification {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "default" | "destructive";
  delay: number;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: Truck,
    title: "Free Shipping",
    description: "Get free delivery on all orders above ₹499 across India.",
    variant: "default",
    delay: 1200,
  },
  {
    id: 2,
    icon: Package,
    title: "New Arrivals",
    description: "ESP32-S3 boards and HC-SR04 ultrasonic sensors now in stock.",
    variant: "default",
    delay: 2600,
  },
  {
    id: 3,
    icon: IndianRupee,
    title: "COD Available",
    description: "Cash on Delivery available on all orders, pan India.",
    variant: "default",
    delay: 4000,
  },
];

const AUTO_DISMISS_MS = 5000;

export function SiteNotifications() {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    NOTIFICATIONS.forEach((n) => {
      // Show
      timers.push(setTimeout(() => {
        setVisible((prev) => [...prev, n.id]);
      }, n.delay));

      // Auto-dismiss
      timers.push(setTimeout(() => {
        setVisible((prev) => prev.filter((id) => id !== n.id));
      }, n.delay + AUTO_DISMISS_MS));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const dismiss = (id: number) => {
    setVisible((prev) => prev.filter((v) => v !== id));
  };

  const activeNotifications = NOTIFICATIONS.filter((n) => visible.includes(n.id));

  return (
    <div className="fixed right-4 top-24 z-[90] flex flex-col gap-3 w-80">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((n) => {
          const Icon = n.icon;
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ x: 80, opacity: 0, scale: 0.96 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 80, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Alert variant={n.variant} className="relative pr-8">
                <Icon className="h-4 w-4" />
                <AlertTitle className="text-sm">{n.title}</AlertTitle>
                <AlertDescription className="text-xs opacity-90">
                  {n.description}
                </AlertDescription>
                <button
                  onClick={() => dismiss(n.id)}
                  aria-label="Dismiss notification"
                  className="absolute right-2 top-2 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Alert>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
