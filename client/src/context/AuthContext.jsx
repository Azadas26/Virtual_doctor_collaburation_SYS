import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('ehb_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [profile, setProfile] = useState(null);
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const res = await API.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
                setProfile(res.data.profile);
                setHospital(res.data.hospital);
                localStorage.setItem('ehb_user', JSON.stringify(res.data.user));
            }
        } catch (error) {
            console.error('Fetch Me Error:', error);
            setUser(null);
            setProfile(null);
            setHospital(null);
            localStorage.removeItem('ehb_token');
            localStorage.removeItem('ehb_user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('ehb_token');
        if (token) {
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        if (res.data.success) {
            localStorage.setItem('ehb_token', res.data.token);
            localStorage.setItem('ehb_user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            await fetchCurrentUser();
            return res.data;
        }
    };

    const register = async (formData) => {
        const res = await API.post('/auth/register', formData);
        if (res.data.success) {
            localStorage.setItem('ehb_token', res.data.token);
            localStorage.setItem('ehb_user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            await fetchCurrentUser();
            return res.data;
        }
    };

    const logout = () => {
        localStorage.removeItem('ehb_token');
        localStorage.removeItem('ehb_user');
        setUser(null);
        setProfile(null);
        setHospital(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                hospital,
                loading,
                login,
                register,
                logout,
                refreshProfile: fetchCurrentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
