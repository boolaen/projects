'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, api } from '@/lib/api';

export default function MyProfilePage() {
    const router = useRouter();

    useEffect(() => {
        

        apiFetch('/users/me', {
                credentials: 'include',
            headers: { }
        })
            .then(res => {
                if (!res.ok) {
                    // Token expired or invalid — redirect to login
                    router.push('/login');
                    return null;
                }
                return res.json();
            })
            .then(user => {
                if (user) {
                    router.push(`/profile/${user.username}`);
                }
            })
            .catch(() => {
                router.push('/login');
            });
    }, []);

    return (
        <main className="flex flex-col min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </main>
    );
}
