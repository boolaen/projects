'use client';

import Link from 'next/link';
import {
    Home, Layers, CreditCard, Sparkles, Upload, Flame, Compass,
    Info, ShieldCheck,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string | null;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
    const pathname = usePathname();

    const mainNavItems = [
        { label: 'Anasayfa', href: '/anasayfa', icon: Home, highlight: false },
        { label: 'Kategoriler', href: '/modeller', icon: Layers, highlight: false },
        { label: 'Abonelikler', href: '/abonelikler', icon: CreditCard, highlight: false },
        { label: 'Premium', href: '/premium', icon: Sparkles, highlight: true },
    ];

    if (userRole === 'ADMIN' || userRole === 'CREATOR') {
        mainNavItems.push({ label: 'Yükle', href: '/yukle', icon: Upload, highlight: false });
    }

    const categories = [
        { label: 'Keşfet', href: '/modeller/All', icon: Compass },
        { label: 'Trendler', href: '/modeller/Trending', icon: Flame },
    ];

    const isCollapsed = !isOpen;

    const NavItem = ({ item, isActive }: { item: typeof mainNavItems[0]; isActive: boolean }) => {
        const linkContent = (
            <Link
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={`relative flex items-center rounded-xl font-medium transition-all duration-200 group
                    ${isActive
                        ? 'bg-gradient-to-r from-red-500/10 to-transparent text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}
                    ${isCollapsed
                        ? 'lg:flex-col lg:justify-center lg:px-1 lg:py-2.5 px-3.5 py-2.5 gap-3'
                        : 'px-3.5 py-2.5 gap-3'}`}
            >
                {/* Active bar */}
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active"
                        className={`absolute bg-red-500 rounded-r-full
                            ${isCollapsed ? 'lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[3px] lg:h-5 left-0 top-1/2 -translate-y-1/2 w-[3px] h-5' : 'left-0 top-1/2 -translate-y-1/2 w-[3px] h-5'}`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                )}

                {/* Icon */}
                <div className={`shrink-0 p-1.5 rounded-lg transition-all duration-200
                    ${isActive ? 'text-red-500 bg-red-500/10' : item.highlight ? 'text-amber-500' : 'group-hover:text-foreground group-hover:bg-secondary/80'}`}>
                    <item.icon className="w-[18px] h-[18px]" />
                </div>

                {/* Label */}
                <span className={`whitespace-nowrap text-[13px] transition-all duration-300
                    ${item.highlight ? 'text-amber-500 font-semibold' : 'font-medium'}
                    ${isCollapsed ? 'lg:text-[9px] lg:font-semibold lg:mt-0 lg:opacity-70' : ''}`}>
                    {item.label}
                </span>
            </Link>
        );

        if (isCollapsed) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="hidden lg:block font-medium text-xs">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return linkContent;
    };

    return (
        <>
            {/* Mobile backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="sidebar-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-[70] lg:z-40 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                    bg-background/80 backdrop-blur-xl border-r border-border/50
                    ${isOpen
                        ? 'w-56 translate-x-0'
                        : 'w-56 lg:w-[4.5rem] -translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Subtle gradient */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-red-500/[0.02] to-transparent pointer-events-none" />

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 relative z-10">

                    {/* Main nav */}
                    <div className={`space-y-0.5 ${isCollapsed ? 'lg:px-1.5 px-2.5' : 'px-2.5'}`}>
                        {mainNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/anasayfa' && pathname?.startsWith(item.href));
                            return <NavItem key={item.href} item={item} isActive={!!isActive} />;
                        })}
                    </div>

                    {/* Divider */}
                    <div className={`my-3 ${isCollapsed ? 'lg:mx-3 mx-4' : 'mx-4'}`}>
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>

                    {/* Categories */}
                    <div className={`space-y-0.5 ${isCollapsed ? 'lg:px-1.5 px-2.5' : 'px-2.5'}`}>
                        <h3 className={`px-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2 transition-all duration-300
                            ${isCollapsed && 'lg:hidden'}`}>
                            Keşfet
                        </h3>
                        {categories.map((cat) => {
                            const isActive = pathname === cat.href || pathname?.includes(cat.href);
                            return <NavItem key={cat.href} item={{ ...cat, highlight: false }} isActive={!!isActive} />;
                        })}
                    </div>
                </div>

                {/* Footer — icons only when collapsed */}
                <div className={`border-t border-border/30 mt-auto transition-all duration-200
                    ${isCollapsed ? 'lg:p-2 p-3' : 'p-3'}`}>
                    <div className={`flex items-center justify-center gap-2 text-muted-foreground/40
                        ${isCollapsed ? 'lg:flex-col lg:gap-1' : 'gap-3'}`}>
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/hakkimizda" className="hover:text-foreground/70 transition-colors">
                                        {isCollapsed ? (
                                            <span className="lg:block hidden"><Info className="w-3.5 h-3.5" /></span>
                                        ) : null}
                                        <span className={isCollapsed ? 'lg:hidden text-[10px] font-medium' : 'text-[10px] font-medium'}>Hakkımızda</span>
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" className="hidden lg:block text-xs">Hakkımızda</TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        {!isCollapsed && <span className="text-border hidden lg:inline">·</span>}
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/gizlilik" className="hover:text-foreground/70 transition-colors">
                                        {isCollapsed ? (
                                            <span className="lg:block hidden"><ShieldCheck className="w-3.5 h-3.5" /></span>
                                        ) : null}
                                        <span className={isCollapsed ? 'lg:hidden text-[10px] font-medium' : 'text-[10px] font-medium'}>Gizlilik</span>
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" className="hidden lg:block text-xs">Gizlilik</TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </aside>
        </>
    );
}
