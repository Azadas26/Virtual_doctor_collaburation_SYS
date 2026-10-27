import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const getRoleHomePath = (role) => {
    switch (role) {
        case 'MAIN_ADMIN': return '/admin/dashboard';
        case 'HOSPITAL_ADMIN': return '/hospital/dashboard';
        case 'FIXED_DOCTOR': return '/doctor/dashboard';
        case 'TEMPORARY_DOCTOR': return '/temp-doctor/dashboard';
        case 'PATIENT': return '/patient/dashboard';
        default: return '/';
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('ehb_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [profile, setProfile] = useState(null);
    const [hospital, setHospital] = useState(null);
    const [hospitalStatus, setHospitalStatus] = useState(() => {
        return localStorage.getItem('ehb_hospital_status') || null;
    });
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const res = await API.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
                setProfile(res.data.profile);
                setHospital(res.data.hospital);
                const hs = res.data.hospitalStatus || null;
                setHospitalStatus(hs);
                localStorage.setItem('ehb_user', JSON.stringify(res.data.user));
                if (hs) localStorage.setItem('ehb_hospital_status', hs);
                else localStorage.removeItem('ehb_hospital_status');
            }
        } catch (error) {
            console.error('Fetch Me Error:', error);
            setUser(null);
            setProfile(null);
            setHospital(null);
            setHospitalStatus(null);
            localStorage.removeItem('ehb_token');
            localStorage.removeItem('ehb_user');
            localStorage.removeItem('ehb_hospital_status');
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
            if (res.data.hospitalStatus) {
                localStorage.setItem('ehb_hospital_status', res.data.hospitalStatus);
            } else {
                localStorage.removeItem('ehb_hospital_status');
            }
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
            if (res.data.hospitalStatus) {
                localStorage.setItem('ehb_hospital_status', res.data.hospitalStatus);
            } else {
                localStorage.removeItem('ehb_hospital_status');
            }
            setUser(res.data.user);
            await fetchCurrentUser();
            return res.data;
        }
    };

    const logout = () => {
        localStorage.removeItem('ehb_token');
        localStorage.removeItem('ehb_user');
        localStorage.removeItem('ehb_hospital_status');
        setUser(null);
        setProfile(null);
        setHospital(null);
        setHospitalStatus(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                hospital,
                hospitalStatus,
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
