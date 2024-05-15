import React, { createContext, useContext, useEffect, useState } from "react";

import { Session, User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export const AuthContext = createContext<{
    user: User | null;
    session: Session | null;
}>({
    user: null,
    session: null,
});

export const AuthContextProvider = (props: object) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    async function getUser() {
        const {
            data: { user: userResponse },
            error,
        } = await supabase!.auth.getUser();
        if (error) {
            console.error(error);
            return;
        }
        console.log("User Response", userResponse);
        setUser(userResponse);

        const {
            data: { session: newSession },
            error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
            console.error(sessionError);
            return;
        }
        if (newSession && userResponse) newSession.user = userResponse;

        setSession(newSession);
    }

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log(`Supabase auth event: ${event}`);
                if (session && newSession?.expires_at !== session?.expires_at) {
                    setUser(null);
                    return;
                }

                switch (event) {
                    case "SIGNED_IN": {
                        if (newSession) await getUser();
                        break;
                    }
                    case "INITIAL_SESSION":
                    case "USER_UPDATED":
                        if (newSession) await getUser();
                        break;
                    case "SIGNED_OUT":
                        setUser(null);
                        break;
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        console.log(user);
    }, [user]);

    const value = {
        user,
        session,
    };

    return (
        <AuthContext.Provider
            value={value}
            {...props}
        />
    );
};

export const useUser = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a AuthContextProvider.");
    }
    return context;
};
