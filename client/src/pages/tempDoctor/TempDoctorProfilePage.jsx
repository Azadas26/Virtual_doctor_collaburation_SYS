import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Award } from 'lucide-react';

const TempDoctorProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verification document state
    const [documentType, setDocumentType] = useState('MCI Certificate');
    const [documentNumber, setDocumentNumber] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/temporary-doctors/profile');
            if (res.data.success) {
                setProfile(res.data.profile);
            }
        } catch (error) {
            console.error('Fetch temp doctor profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('documentType', documentType);
            formData.append('documentNumber', documentNumber);
            if (selectedFile) {
                formData.append('document', selectedFile);
            }

            const res = await API.post('/temporary-doctors/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                alert('Verification document uploaded! Hospital superintendents can inspect during credential verification.');
                setDocumentNumber('');
                setSelectedFile(null);
                // reset file input
                const fileInput = document.getElementById('doc-file-input');
                if (fileInput) fileInput.value = '';
                fetchProfile();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error uploading document.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <Award className="w-3.5 h-3.5" /> Voluntary Doctor Credential File
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Medical Qualifications & Credential Verification
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Maintain your professional profile, medical registration details, and uploaded certificates for government hospital superintendents.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading credentials profile...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left 2 Cols: Profile Info & Status */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-slate-900">{profile?.doctorName || 'Dr. Voluntary Doctor'}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{profile?.medicalQualification} • Specialization: {profile?.specialization}</p>
                                    </div>
                                    {profile?.verificationStatus === 'VERIFIED' ? (
                                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Credentials Verified
                                        </span>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" /> Pending Hospital Verification
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                        <span className="font-bold text-slate-500 block mb-1">Medical Registration Number</span>
                                        <p className="font-mono font-bold text-slate-900 text-sm">{profile?.registrationNumber}</p>
                                        <span className="text-slate-400">Authority: {profile?.registrationAuthority || 'Medical Council of India / State Council'}</span>
                                    </div>

                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                        <span className="font-bold text-slate-500 block mb-1">Doctor Type & Experience</span>
                                        <p className="font-bold text-slate-900 text-sm">{profile?.doctorCategory || 'RETIRED / FREELANCE'}</p>
                                        <span className="text-slate-500">{profile?.yearsOfExperience} Years Clinical Practice</span>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Verification Documents List */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-600" /> Uploaded Qualification & MCI Certificates
                                </h3>

                                {profile?.documents && profile.documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {profile.documents.map((doc, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">{doc.documentType}</p>
                                                    <p className="text-slate-500 font-mono text-[11px]">Doc #: {doc.documentNumber}</p>
                                                </div>
                                                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                    Attached
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                                        No qualification certificates attached yet. Upload below.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Col: Upload Document Form */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Upload className="w-5 h-5 text-amber-600" /> Attach Verification Certificate
                            </h3>

                            <form onSubmit={handleDocumentUpload} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Document Type
                                    </label>
                                    <select
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    >
                                        <option value="MCI Certificate">Medical Council Registration Certificate</option>
                                        <option value="Degree Certificate">MBBS / MD Degree Certificate</option>
                                        <option value="Identity Proof">Government ID (Aadhaar/PAN)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Document / Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                        placeholder="MCI-KL-12345"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Upload Certificate File
                                    </label>
                                    <label
                                        htmlFor="doc-file-input"
                                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50 hover:border-teal-400 transition"
                                    >
                                        {selectedFile ? (
                                            <div className="text-center px-2">
                                                <p className="text-xs font-bold text-teal-700 truncate max-w-[160px]">{selectedFile.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                                <p className="text-[10px] text-slate-500">Click to choose PDF / Image</p>
                                            </div>
                                        )}
                                    </label>
                                    <input
                                        id="doc-file-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition"
                                >
                                    {uploading ? 'Uploading Certificate...' : 'Upload Verification Certificate'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TempDoctorProfilePage;
