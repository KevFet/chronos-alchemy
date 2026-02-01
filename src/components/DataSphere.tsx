"use client";

import { motion } from "framer-motion";
import { Item, ItemState, Dimension } from "../types/game";
import { cn } from "@/lib/utils";

interface DataSphereProps {
    item: Item;
    state: ItemState;
    onDragEnd?: (event: any, info: any) => void;
    className?: string;
    layoutId?: string;
}

const dimensionColors: Record<Dimension, string> = {
    matiere: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    concept: "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
    micro: "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    macro: "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
    imaginaire: "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
};

export function DataSphere({ item, state, onDragEnd, className, layoutId }: DataSphereProps) {
    const isHibernated = state === ItemState.HIBERNATION;
    const isObsolete = state === ItemState.OBSOLETE;

    return (
        <motion.div
            layoutId={layoutId || item.id}
            drag={!isHibernated}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={onDragEnd}
            whileHover={!isHibernated ? { scale: 1.1, rotate: 5 } : {}}
            whileTap={!isHibernated ? { scale: 0.9, rotate: -5 } : {}}
            className={cn(
                "relative group flex flex-col items-center justify-center cursor-grab active:cursor-grabbing",
                className
            )}
        >
            {/* The Sphere */}
            <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                "glass-2026 border-[1.5px] glass-glow",
                dimensionColors[item.dimension as Dimension],
                isHibernated && "opacity-30 grayscale cursor-not-allowed",
                isObsolete && "opacity-50 grayscale"
            )}>
                <span className="text-4xl filter drop-shadow-lg">{item.emoji}</span>

                {/* Animated outer ring on hover */}
                {!isHibernated && (
                    <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-white/20 group-hover:scale-125 transition-all duration-700 pointer-events-none" />
                )}
            </div>

            {/* Item Name */}
            <div className="mt-2 text-center">
                <span className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300 transition-colors group-hover:text-white",
                    isHibernated && "text-slate-600"
                )}>
                    {item.name}
                </span>
            </div>

            {/* Pivot Indicator */}
            {item.is_pivot && (
                <div className="absolute top-0 right-0">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_#eab308]"
                    />
                </div>
            )}
        </motion.div>
    );
}
