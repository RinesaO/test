import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import MSHLayout from '../../components/msh/MSHLayout';

const MSHDashboard = () => {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await axios.get('/api/msh/pending-doctors');
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setMessage(t('msh.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await axios.post('/api/msh/approve-doctor', { doctorId });
      setMessage(t('msh.doctorApproved'));
      fetchPendingDoctors();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await axios.post('/api/msh/reject-doctor', { doctorId });
      setMessage(t('msh.doctorRejected'));
      fetchPendingDoctors();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const viewFile = (doctorId, fileType) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${apiUrl}/api/msh/view-file/${doctorId}/${fileType}`, '_blank');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <MSHLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MSHLayout>
    );
  }

  return (
    <MSHLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('msh.pendingApplications')}</h1>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('Error') || message.includes('Gabim') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {doctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">{t('msh.noPendingApplications')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('msh.doctorFullName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('auth.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('msh.specialization')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('msh.licenseNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('msh.applicationDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('msh.documents')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('msh.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doctor.firstName} {doctor.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doctor.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {doctor.licenseFile && (
                          <button
                            onClick={() => viewFile(doctor._id, 'license')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title={t('msh.viewLicense')}
                          >
                            📄 {t('msh.viewLicense')}
                          </button>
                        )}
                        {doctor.idCardFile && (
                          <button
                            onClick={() => viewFile(doctor._id, 'idCard')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title={t('msh.viewIdCard')}
                          >
                            🆔 {t('msh.viewIdCard')}
                          </button>
                        )}
                        {doctor.certificateFile && (
                          <button
                            onClick={() => viewFile(doctor._id, 'certificate')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title={t('msh.viewCertificate')}
                          >
                            📜 {t('msh.viewCertificate')}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleApprove(doctor._id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        {t('msh.approve')}
                      </button>
                      <button
                        onClick={() => handleReject(doctor._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('msh.reject')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MSHLayout>
  );
};

export default MSHDashboard;

