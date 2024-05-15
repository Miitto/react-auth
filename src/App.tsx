import { useEffect } from "react";
import "./App.css";
import { useUser } from "./AuthProvider";
import { supabase } from "./supabase";

function App() {
    const { user } = useUser();

    async function login() {
        await supabase.auth.signInWithPassword({
            email: "email@email.com",
            password: "password",
        });
    }

    async function logout() {
        await supabase.auth.signOut();
    }

    useEffect(() => {
        console.log(user);
    }, [user]);

    return (
        <>
            <p>User ID: {user?.id}</p>
            <button onClick={login}>Sign In</button>
            <button onClick={logout}>Sign Out</button>
        </>
    );
}

export default App;
