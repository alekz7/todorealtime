"use client";

import { useState, useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  backgroundGradient?: string;
  rotationIntensity?: number;
  borderRadius?: string;
  glareIntensity?: number;
  shadow?: string;
}

export function Card3D({
  children,
  className = "",
  backgroundGradient = "linear-gradient(135deg, rgb(253, 186, 116), rgb(253, 164, 175))",
  rotationIntensity = 10,
  borderRadius = "1.5rem",
  glareIntensity = 0.2,
  shadow = "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
}: Card3DProps) {
  const [hover, setHover] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Spring animations for smoother motion
  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [rotationIntensity, -rotationIntensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-rotationIntensity, rotationIntensity]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-1, 1], ["0%", "100%"]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-1, 1], ["0%", "100%"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize mouse position from -0.5 to 0.5
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        borderRadius,
        background: backgroundGradient,
        boxShadow: hover ? shadow : "none",
        transformStyle: "preserve-3d",
        perspective: "1000px",
        transformPerspective: "1000px",
      }}
      animate={{ scale: hover ? 1.02 : 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Glare effect */}
        {hover && (
          <motion.div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareIntensity}), transparent 50%)`,
              borderRadius,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}