"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FusionPadProps {
    isHovered?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export function FusionPad({ isHovered, children, className }: FusionPadProps) {
    return (
        <div className={cn(
            "relative w-80 h-80 rounded-[3rem] flex items-center justify-center transition-all duration-700",
            "glass-2026 border-white/5",
            isHovered ? "bg-white/5 border-white/20 scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)]" : "shadow-[0_0_30px_rgba(0,0,0,0.5)]",
            className
        )}>
            {/* Inner circular guide */}
            <div className="absolute inset-8 rounded-full border border-white/5 border-dashed animate-[spin_20s_linear_infinite]" />

            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-sm" />

            {/* Glow effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 rounded-[3.5rem] bg-blue-500/10 blur-[60px]"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
