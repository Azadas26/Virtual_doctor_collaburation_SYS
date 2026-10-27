import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import HospitalSearchPage from './pages/HospitalSearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Main Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminHospitalsPage from './pages/admin/AdminHospitalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Hospital Sub-Admin Pages
import HospitalDashboardPage from './pages/hospital/HospitalDashboardPage';
import HospitalQueuePage from './pages/hospital/HospitalQueuePage';
import HospitalDoctorsPage from './pages/hospital/HospitalDoctorsPage';
import HospitalRequirementsPage from './pages/hospital/HospitalRequirementsPage';
import HospitalRequestsPage from './pages/hospital/HospitalRequestsPage';
import HospitalContractsPage from './pages/hospital/HospitalContractsPage';

// Fixed & Doctor Pages
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import DoctorQueuePage from './pages/doctor/DoctorQueuePage';
import DoctorConsultationsPage from './pages/doctor/DoctorConsultationsPage';

// Voluntary Temp Doctor Pages
import TempDoctorDashboardPage from './pages/tempDoctor/TempDoctorDashboardPage';
import TempDoctorProfilePage from './pages/tempDoctor/TempDoctorProfilePage';
import TempDoctorHospitalsPage from './pages/tempDoctor/TempDoctorHospitalsPage';
import TempDoctorContractsPage from './pages/tempDoctor/TempDoctorContractsPage';

// Patient Pages
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import PatientMedicalHistoryPage from './pages/patient/PatientMedicalHistoryPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

import { useAuth, getRoleHomePath } from './context/AuthContext';

// Redirects any unmatched route to the user's role home, or to /login if not authenticated
const RoleRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return <Navigate to={user ? getRoleHomePath(user.role) : '/login'} replace />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                    <Navbar />
                    <div className="flex-1">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/hospitals" element={<HospitalSearchPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Main Admin Routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['MAIN_ADMIN']}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/hospitals"
                                element={
                                    <ProtectedRoute allowedRoles={['MAIN_ADMIN']}>
                                        <AdminHospitalsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    <ProtectedRoute allowedRoles={['MAIN_ADMIN']}>
                                        <AdminUsersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/audit-logs"
                                element={
                                    <ProtectedRoute allowedRoles={['MAIN_ADMIN']}>
                                        <AdminAuditLogsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports"
                                element={
                                    <ProtectedRoute allowedRoles={['MAIN_ADMIN']}>
                                        <AdminReportsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Hospital Sub-Admin Routes */}
                            <Route
                                path="/hospital/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                                        <HospitalDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/hospital/queue"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                                        <HospitalQueuePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/hospital/doctors"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                                        <HospitalDoctorsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/hospital/requirements"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                                        <HospitalRequirementsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/hospital/requests"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                                        <HospitalRequestsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/hospital/contracts"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                                        <HospitalContractsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/hospital/consultations"
                                element={
                                    <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'MAIN_ADMIN']}>
                                        <DoctorConsultationsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Fixed Doctor Routes */}
                            <Route
                                path="/doctor/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['FIXED_DOCTOR', 'TEMPORARY_DOCTOR']}>
                                        <DoctorDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/doctor/queue"
                                element={
                                    <ProtectedRoute allowedRoles={['FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'HOSPITAL_ADMIN']}>
                                        <DoctorQueuePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/doctor/consultations"
                                element={
                                    <ProtectedRoute allowedRoles={['FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'HOSPITAL_ADMIN']}>
                                        <DoctorConsultationsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Voluntary Temp Doctor Routes */}
                            <Route
                                path="/temp-doctor/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['TEMPORARY_DOCTOR']}>
                                        <TempDoctorDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/temp-doctor/profile"
                                element={
                                    <ProtectedRoute allowedRoles={['TEMPORARY_DOCTOR']}>
                                        <TempDoctorProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/temp-doctor/hospitals"
                                element={
                                    <ProtectedRoute allowedRoles={['TEMPORARY_DOCTOR']}>
                                        <TempDoctorHospitalsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/temp-doctor/contracts"
                                element={
                                    <ProtectedRoute allowedRoles={['TEMPORARY_DOCTOR']}>
                                        <TempDoctorContractsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/temp-doctor/schedule"
                                element={
                                    <ProtectedRoute allowedRoles={['TEMPORARY_DOCTOR', 'FIXED_DOCTOR']}>
                                        <DoctorQueuePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/temp-doctor/consultations"
                                element={
                                    <ProtectedRoute allowedRoles={['TEMPORARY_DOCTOR', 'FIXED_DOCTOR']}>
                                        <DoctorConsultationsPage />
                                    </ProtectedRoute>
                                }
                            />


                            {/* Patient Routes */}
                            <Route
                                path="/patient/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['PATIENT']}>
                                        <PatientDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/patient/book-appointment"
                                element={
                                    <ProtectedRoute allowedRoles={['PATIENT']}>
                                        <BookAppointmentPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/patient/appointments"
                                element={
                                    <ProtectedRoute allowedRoles={['PATIENT']}>
                                        <PatientAppointmentsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/patient/medical-history"
                                element={
                                    <ProtectedRoute allowedRoles={['PATIENT']}>
                                        <PatientMedicalHistoryPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/patient/profile"
                                element={
                                    <ProtectedRoute allowedRoles={['PATIENT']}>
                                        <PatientProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch-all: redirect to role home or login */}
                            <Route path="*" element={<RoleRedirect />} />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
