
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin, // Redirects back to here
            },
        });
        if (error) throw error;
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            // Ignore "Auth session missing" error - user is already logged out
            if (error && !error.message?.includes('Auth session missing')) {
                throw error;
            }
        } catch (error) {
            // If signOut fails for any reason, still clear the local state
            console.warn('Logout warning:', error.message);
        }
        // Always clear local state regardless of signOut result
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
