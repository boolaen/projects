'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface SiteSettings {
    siteName: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    isLoading: boolean;
}

const defaultSettings: SiteSettings = {
    siteName: 'ADUKET',
    logoUrl: null,
    bannerUrl: null,
    isLoading: true,
};

interface SiteSettingsContextType extends SiteSettings {
    refreshSettings: () => Promise<void>;
}

const defaultContext: SiteSettingsContextType = {
    ...defaultSettings,
    refreshSettings: async () => { },
};

const SiteSettingsContext = createContext<SiteSettingsContextType>(defaultContext);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

    const fetchSettings = async () => {
        try {
            const res = await apiFetch('/users/settings/global', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    siteName: data.siteName || 'ADUKET',
                    logoUrl: data.logoUrl || null,
                    bannerUrl: data.bannerUrl || null,
                    isLoading: false,
                });

                // Update document title globally
                if (data.siteName) {
                    document.title = `${data.siteName} - Premium Adult Streaming`;
                }
            } else {
                setSettings(s => ({ ...s, isLoading: false }));
            }
        } catch (error) {
            setSettings(s => ({ ...s, isLoading: false }));
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ ...settings, refreshSettings: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
