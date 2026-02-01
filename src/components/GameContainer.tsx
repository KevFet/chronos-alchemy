"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Item, ItemState, UserProgress, Dimension } from "../types/game";
import { GameEngine } from "../logic/GameEngine";
import { DataSphere } from "./DataSphere";
import { FusionPad } from "./FusionPad";
import { MoveRight, History, HelpCircle, LogIn, LogOut, User as UserIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signInWithGoogle, logout } from "@/lib/auth";
import { saveUserProgress, loadUserProgress, fetchItemsLibrary } from "@/lib/db";
import { onAuthStateChanged, User } from "firebase/auth";

export function GameContainer() {
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const engine = useMemo(() => new GameEngine(allItems), [allItems]);

    const [progress, setProgress] = useState<UserProgress>({
        discoveredItems: ["terre", "eau", "feu", "air"],
        currentEra: 0,
        inventory: ["terre", "eau", "feu", "air"]
    });

    // Load items and auth state
    useEffect(() => {
        const init = async () => {
            const items = await fetchItemsLibrary();
            setAllItems(items || []);

            onAuthStateChanged(auth, async (u) => {
                setUser(u);
                if (u) {
                    const cloudProgress = await loadUserProgress(u.uid);
                    if (cloudProgress) {
                        setProgress(cloudProgress);
                    }
                }
                setLoading(false);
            });
        };
        init();
    }, []);

    // Save progress when it changes
    useEffect(() => {
        if (user && !loading) {
            saveUserProgress(user.uid, progress);
        }
    }, [progress, user, loading]);

    const [activeItems, setActiveItems] = useState<{ id: string; instanceId: number; x: number; y: number }[]>([]);
    const [nextInstanceId, setNextInstanceId] = useState(0);
    const [activeTab, setActiveTab] = useState<Dimension | 'all'>('all');
    const [isHoveringPad, setIsHoveringPad] = useState(false);
    const [fusionFeedback, setFusionFeedback] = useState<{ x: number, y: number, type: 'success' | 'fail' } | null>(null);

    const isFirebaseMissing = !auth.app.options.apiKey || auth.app.options.apiKey === "dummy-key";

    // Add item from deck to workspace
    const addToWorkspace = (itemId: string) => {
        setActiveItems(prev => [...prev, { id: itemId, instanceId: nextInstanceId, x: 0, y: 0 }]);
        setNextInstanceId(id => id + 1);
    };

    const handleDragEnd = (instanceId: number, info: any) => {
        setActiveItems(prev => {
            const draggedIndex = prev.findIndex(i => i.instanceId === instanceId);
            if (draggedIndex === -1) return prev;

            const newItems = [...prev];
            const dragged = { ...newItems[draggedIndex], x: info.point.x, y: info.point.y };
            newItems[draggedIndex] = dragged;

            // Check for collisions
            for (let i = 0; i < newItems.length; i++) {
                if (i === draggedIndex) continue;

                const other = newItems[i];
                const dist = Math.sqrt(Math.pow(dragged.x - other.x, 2) + Math.pow(dragged.y - other.y, 2));

                if (dist < 80) { // Collision threshold
                    const result = engine.fuse(dragged.id, other.id, progress);
                    if (result) {
                        // Fusion Success!
                        setFusionFeedback({ x: other.x, y: other.y, type: 'success' });
                        setTimeout(() => setFusionFeedback(null), 1000);

                        const newActiveBatch = [...newItems];

                        const item1 = allItems.find(it => it.id === dragged.id)!;
                        const item2 = allItems.find(it => it.id === other.id)!;

                        let nextDiscovered = [...progress.discoveredItems];
                        let nextInventory = [...progress.inventory];

                        if (!nextDiscovered.includes(result.id)) {
                            nextDiscovered.push(result.id);
                            nextInventory.push(result.id);
                        }

                        if (item1.is_ephemeral) nextInventory = nextInventory.filter(id => id !== item1.id);
                        if (item2.is_ephemeral) nextInventory = nextInventory.filter(id => id !== item2.id);

                        setProgress(prev => ({
                            ...prev,
                            discoveredItems: nextDiscovered,
                            inventory: nextInventory
                        }));

                        const filtered = newActiveBatch.filter((_, idx) => idx !== i && idx !== draggedIndex);
                        return [...filtered, { id: result.id, instanceId: nextInstanceId, x: other.x, y: other.y }];
                    } else {
                        setFusionFeedback({ x: dragged.x, y: dragged.y, type: 'fail' });
                        setTimeout(() => setFusionFeedback(null), 800);
                    }
                }
            }
            return newItems;
        });
        setNextInstanceId(id => id + 1);
    };

    // Era management
    const nextEra = () => {
        if (engine.canAdvanceEra(progress)) {
            setProgress(prev => ({ ...prev, currentEra: prev.currentEra + 1 }));
        }
    };

    const eras = [
        'Préhistoire', 'Antiquité', 'Moyen-Âge', 'Renaissance', 'Révolution Industrielle',
        'Âge Atomique', 'Ère Numérique', 'Âge Spatial', 'Ère de l\'IA', 'Bio-Ingénierie',
        'Nano-Ère', 'Ère Quantique', 'Ère Galactique', 'Ère Post-Humaine', 'La Singularité'
    ];

    const currentEraName = eras[progress.currentEra];

    const eraColors: Record<number, { start: string, mid: string, end: string }> = {
        0: { start: "#78350f", mid: "#451a03", end: "#020617" }, // Préhistoire
        1: { start: "#1e293b", mid: "#0f172a", end: "#020617" }, // Antiquité
        14: { start: "#4c1d95", mid: "#1e1b4b", end: "#020617" }, // Singularité
    };

    const currentColors = eraColors[progress.currentEra] || eraColors[0];

    const currentEraProgress = useMemo(() => {
        const itemsInEra = allItems.filter(item => item.era_unlock === progress.currentEra);
        const discoveredInEra = itemsInEra.filter(item => progress.discoveredItems.includes(item.id));
        return { discovered: discoveredInEra.length, total: itemsInEra.length };
    }, [allItems, progress.discoveredItems, progress.currentEra]);

    return (
        <div
            className="flex flex-col h-screen w-screen overflow-hidden text-white font-sans transition-all duration-1000 aurora-bg"
            style={{
                '--era-start': currentColors.start,
                '--era-mid': currentColors.mid,
                '--era-end': currentColors.end
            } as any}
        >
            {/* Header / Era Info */}
            <div className="p-6 flex justify-between items-center glass-2026 m-4 flex-shrink-0 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="absolute -inset-2 border border-white/5 rounded-full"
                        />
                        <div className="relative glass-2026 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            {progress.currentEra + 1}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter uppercase italic">{currentEraName}</h1>
                        <p className="text-[10px] tracking-[0.3em] text-slate-400 uppercase font-black">Dimensions Unies</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2 flex items-center gap-2">
                            Sincronisation Temporelle
                            <Sparkles size={10} className="text-blue-400 animate-pulse" />
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden glass-glow">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentEraProgress.discovered / currentEraProgress.total) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                            <span className="text-[10px] font-black tracking-tighter opacity-60 italic">{currentEraProgress.discovered} / {currentEraProgress.total}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 glass-2026 border-white/10">
                                <UserIcon size={14} className="text-blue-400" />
                                <span className="text-[11px] font-black uppercase tracking-wider">{user.displayName}</span>
                            </div>
                            <button onClick={logout} className="p-2 glass-2026 hover:bg-red-500/20 text-red-400 border-red-500/20" title="Déconnexion">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="flex items-center gap-2 px-6 py-2 bg-white text-black font-black uppercase tracking-tighter rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            <LogIn size={16} /> Initier Link
                        </button>
                    )}
                    <div className="w-px h-8 bg-white/5 my-auto mx-1" />
                    <button className="p-2 glass-2026 hover:border-white/20 transition-all hover:bg-white/5">
                        <History size={18} className="text-slate-400" />
                    </button>
                    <button className="p-2 glass-2026 hover:border-white/20 transition-all hover:bg-white/5">
                        <HelpCircle size={18} className="text-slate-400" />
                    </button>
                    {engine.canAdvanceEra(progress) && (
                        <button
                            onClick={nextEra}
                            className="flex items-center gap-2 px-8 py-2 bg-yellow-400 text-black font-black uppercase tracking-tighter rounded-full hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all animate-pulse"
                        >
                            Saut Temporel <MoveRight size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isFirebaseMissing && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mx-4 mb-4 p-4 glass-2026 border-yellow-500/50 bg-yellow-500/10 text-yellow-200 text-xs flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <HelpCircle size={16} />
                        <span>Configuration Firebase manquante ! Veuillez configurer <strong>.env.local</strong> pour débloquer la persistance et les items.</span>
                    </div>
                </motion.div>
            )}

            {loading && !isFirebaseMissing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium tracking-widest text-blue-400 uppercase">Synchronisation...</p>
                    </div>
                </div>
            )}


            {/* Main Workspace */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <FusionPad isHovered={isHoveringPad}>
                    <AnimatePresence>
                        {activeItems.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                exit={{ opacity: 0 }}
                                className="text-center select-none"
                            >
                                <p className="text-8xl mb-4 grayscale">⚛️</p>
                                <p className="text-xs tracking-[0.5em] uppercase font-black">Prêt pour Fusion</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Items in Workspace */}
                    {activeItems.map((ai) => {
                        const item = allItems.find(i => i.id === ai.id)!;
                        return (
                            <div
                                key={ai.instanceId}
                                className="absolute"
                                onMouseEnter={() => setIsHoveringPad(true)}
                                onMouseLeave={() => setIsHoveringPad(false)}
                            >
                                <DataSphere
                                    item={item}
                                    state={ItemState.ACTIVE}
                                    onDragEnd={(e, info) => handleDragEnd(ai.instanceId, info)}
                                    layoutId={`instance-${ai.instanceId}`}
                                />
                            </div>
                        );
                    })}
                </FusionPad>

                {/* Fusion Feedback (Flash/Shockwave) */}
                <AnimatePresence>
                    {fusionFeedback && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn(
                                "absolute pointer-events-none rounded-full blur-xl border-4",
                                fusionFeedback.type === 'success' ? "bg-white/20 border-yellow-400" : "bg-red-500/10 border-red-500"
                            )}
                            style={{
                                left: fusionFeedback.x - 40,
                                top: fusionFeedback.y - 40,
                                width: 80,
                                height: 80
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Deck / Inventory */}
            <div className="h-64 glass-2026 border-t border-white/5 p-6 backdrop-blur-3xl relative z-20">
                <div className="flex gap-8 mb-6 border-b border-white/5">
                    {(['all', 'matiere', 'concept', 'imaginaire'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-2 text-[10px] tracking-[0.2em] font-black uppercase transition-all relative",
                                activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide px-2">
                    {progress.inventory
                        .filter(itemId => {
                            const item = allItems.find(i => i.id === itemId);
                            if (!item) return false;
                            if (activeTab === 'all') return true;
                            return item.dimension === activeTab;
                        })
                        .map(itemId => {
                            const item = allItems.find(i => i.id === itemId)!;
                            const state = engine.getItemState(itemId, progress);

                            if (state === ItemState.OBSOLETE) return null;

                            return (
                                <div
                                    key={itemId}
                                    onClick={() => state !== ItemState.HIBERNATION && addToWorkspace(itemId)}
                                    className="cursor-pointer flex-shrink-0"
                                >
                                    <DataSphere item={item} state={state} />
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
