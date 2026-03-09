'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Bell, User, Upload, Tv, Settings, Ticket, LogOut, ChevronDown, Menu, Shield, Crown, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { Sidebar } from "./sidebar";
import { useSiteSettings } from "@/components/site-settings-provider";
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function Navbar({ hideSidebar = false }: { hideSidebar?: boolean }) {
    const { siteName, logoUrl } = useSiteSettings();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Initial sidebar state — always closed by default
    useEffect(() => {
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
    }, [hideSidebar]);

    // Sync sidebar state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (isSidebarOpen && window.innerWidth >= 1024) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
        }
    }, [isSidebarOpen]);

    // Cleanup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            return () => document.body.classList.remove('sidebar-open');
        }
    }, []);

    useEffect(() => {
        apiFetch('/users/me')
            .then(res => res.json())
            .then(data => {
                if (data && data.role) setUserRole(data.role);
                if (data && data.username) setUsername(data.username);
                if (data && data.avatarUrl) setAvatarUrl(data.avatarUrl);
            })
            .catch(() => { });

        apiFetch('/users/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUnreadCount(data.filter((n: any) => !n.isRead).length);
                }
            })
            .catch(() => { });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut: "/" to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                searchInputRef.current?.blur();
                setIsMobileSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            router.push(`/ara?q=${encodeURIComponent(q)}`);
            setIsMobileSearchOpen(false);
            searchInputRef.current?.blur();
        }
    };

    const initial = username?.[0]?.toUpperCase() || 'U';

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6 h-16 transition-all duration-300 ${isScrolled
                ? 'bg-background/90 backdrop-blur-lg border-b border-border shadow-sm'
                : 'bg-background/50 backdrop-blur-md border-b border-transparent'
                }`}
        >
            {/* Left: Brand */}
            <div className="flex items-center gap-2 shrink-0">
                <Link href="/anasayfa" className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition-opacity">
                    {logoUrl ? (
                        <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain" />
                    ) : (
                        <Tv className="w-7 h-7 text-red-500" />
                    )}
                    <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent font-black tracking-tight hidden sm:inline">{siteName}</span>
                </Link>
            </div>

            {!hideSidebar && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={userRole} />}

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
                <form onSubmit={handleSearch} className="w-full relative group">
                    <div className={`flex items-center w-full rounded-full border transition-all duration-200
                        ${isSearchFocused
                            ? 'border-red-500/40 bg-background shadow-sm shadow-red-500/5 ring-1 ring-red-500/10'
                            : 'border-border/60 bg-secondary/40 hover:bg-secondary/60'}`}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            placeholder="Video ara..."
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 px-4 py-2 outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="p-1 mr-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 border-l border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-r-full transition-colors"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Keyboard hint */}
                    {!isSearchFocused && !searchQuery && (
                        <div className="absolute right-14 top-1/2 -translate-y-1/2 pointer-events-none">
                            <kbd className="text-[10px] text-muted-foreground/40 bg-secondary/60 border border-border/40 px-1.5 py-0.5 rounded font-mono">/</kbd>
                        </div>
                    )}
                </form>
            </div>

            {/* Mobile search button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
            >
                <Search className="w-5 h-5" />
            </Button>

            {/* Mobile search overlay */}
            {isMobileSearchOpen && (
                <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-start pt-4 px-4 md:hidden">
                    <form onSubmit={handleSearch} className="w-full flex items-center gap-2">
                        <button type="button" onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex-1 flex items-center bg-secondary/60 border border-border rounded-full px-4">
                            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Video ara..."
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 px-3 py-2.5 outline-none"
                            />
                        </div>
                        <button type="submit" className="p-2 text-red-500 font-semibold text-sm">Ara</button>
                    </form>
                </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {(userRole === 'ADMIN' || userRole === 'CREATOR') && (
                    <Link href="/yukle">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                            <Upload className="w-5 h-5" />
                        </Button>
                    </Link>
                )}
                <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg relative">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </Link>
                <div className="h-5 w-px bg-border mx-1 hidden sm:block"></div>

                <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 hover:bg-secondary rounded-xl border border-transparent hover:border-border transition-all duration-200"
                    >
                        {avatarUrl ? (
                            <div className={`relative w-8 h-8 rounded-lg overflow-hidden ring-2 ${userRole === 'PREMIUM' || userRole === 'ADMIN' ? 'ring-amber-500/40' : 'ring-border'}`}>
                                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm">
                                {initial}
                            </div>
                        )}
                        <span className="text-sm font-medium text-muted-foreground hidden lg:inline">Hesabım</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-dropdown-open py-1">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-border bg-secondary/30">
                                <p className="text-sm font-bold text-foreground">{username || 'Kullanıcı'}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    {userRole === 'PREMIUM' || userRole === 'ADMIN' ? (
                                        <span className="text-amber-500 font-bold uppercase flex items-center gap-1 text-[10px] tracking-wider">
                                            <Crown className="w-3 h-3" /> Premium Üye
                                        </span>
                                    ) : (
                                        <span className="capitalize text-[10px] tracking-wider uppercase">{userRole?.toLowerCase() || 'free'} Üye</span>
                                    )}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1 px-1">
                                {userRole === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-semibold mx-0.5"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Admin Paneli
                                    </Link>
                                )}
                                <Link
                                    href="/profile/me"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mx-0.5"
                                >
                                    <User className="w-4 h-4" />
                                    Profilim
                                </Link>
                                <Link
                                    href="/ayarlar"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mx-0.5"
                                >
                                    <Settings className="w-4 h-4" />
                                    Ayarlar
                                </Link>
                                <Link
                                    href="/ayarlar#coupon"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-amber-500/80 hover:text-amber-500 hover:bg-amber-500/10 transition-colors mx-0.5"
                                >
                                    <Ticket className="w-4 h-4" />
                                    Kupon Kodu Kullan
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-border p-1">
                                <button
                                    onClick={() => {
                                        window.location.href = '/login';
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-5 w-px bg-border mx-1 hidden sm:block"></div>
                <ModeToggle />
            </div>
        </nav>
    );
}
