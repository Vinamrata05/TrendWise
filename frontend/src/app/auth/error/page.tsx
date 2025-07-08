"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        default: "An error occurred during authentication.",
        configuration: "There is a problem with the server configuration.",
        accessdenied: "You do not have permission to sign in.",
        verification: "The verification link is no longer valid.",
    };

    const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

    return (
        <div className="container py-16">
            <div className="max-w-md mx-auto text-center">
                <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {errorMessage}
                </div>
                <Button asChild>
                    <Link href="/auth/signin">Try Again</Link>
                </Button>
            </div>
        </div>
    );
} 