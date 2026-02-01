"use client";

import { motion } from "framer-motion";
import { Item, ItemState } from "../types/game";
import { cn } from "@/lib/utils";

interface ItemComponentProps {
    item: Item;
    state: ItemState;
    onDragEnd?: (event: any, info: any) => void;
}

export function ItemComponent({ item, state, onDragEnd }: ItemComponentProps) {
    const isHibernated = state === ItemState.HIBERNATION;
    const isObsolete = state === ItemState.OBSOLETE;

    return (
        <motion.div
            layoutId={item.id}
            drag={!isHibernated}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={onDragEnd}
            whileHover={!isHibernated ? { scale: 1.1 } : {}}
            whileTap={!isHibernated ? { scale: 0.95 } : {}}
            className={cn(
                "relative flex flex-col items-center justify-center p-4 w-24 h-24 glass transition-opacity",
                isHibernated && "opacity-40 grayscale cursor-not-allowed",
                isObsolete && "border-red-500/50"
            )}
        >
            <span className="text-4xl">{item.emoji}</span>
            <span className="text-xs mt-1 font-medium text-center truncate w-full">
                {item.name}
            </span>
            {item.is_pivot && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_yellow]" title="Objet Pivot" />
            )}
        </motion.div>
    );
}
