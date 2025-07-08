import "next-auth";

declare module "next-auth" {
    interface Session {
        backendToken?: string;
        user: {
            id?: string;
            name?: string;
            email?: string;
            image?: string;
            role?: string;
        };
    }

    interface User {
        token?: string;
        role?: string;
        id?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        role?: string;
        id?: string;
    }
} 