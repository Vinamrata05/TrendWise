"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <Navbar />
            <main className="min-h-screen pt-16">
                {children}
            </main>
        </AuthProvider>
    );
} 