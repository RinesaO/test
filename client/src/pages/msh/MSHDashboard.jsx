import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import MSHLayout from '../../components/msh/MSHLayout';

const MSHDashboard = () => {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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

  const viewFile = async (doctorId, fileType) => {
    try {
      const response = await axios.get(`/api/msh/view-file/${doctorId}/${fileType}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
    }
  };

  const downloadFile = async (doctorId, fileType) => {
    try {
      const response = await axios.get(`/api/msh/download-file/${doctorId}/${fileType}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `${fileType}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
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
                      {(doctor.licenseFile || doctor.idCardFile || doctor.certificateFile) && (
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowDocumentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1.5 border border-blue-300 rounded hover:bg-blue-50"
                        >
                          View Documents
                        </button>
                      )}
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

        {/* Document Modal */}
        {showDocumentModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDocumentModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {selectedDoctor.licenseFile && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="text-sm font-medium text-gray-700">License</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewFile(selectedDoctor._id, 'license')}
                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadFile(selectedDoctor._id, 'license')}
                        className="px-3 py-1.5 text-xs text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {selectedDoctor.idCardFile && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="text-sm font-medium text-gray-700">ID Card</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewFile(selectedDoctor._id, 'idCard')}
                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadFile(selectedDoctor._id, 'idCard')}
                        className="px-3 py-1.5 text-xs text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {selectedDoctor.certificateFile && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="text-sm font-medium text-gray-700">Certificate</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewFile(selectedDoctor._id, 'certificate')}
                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadFile(selectedDoctor._id, 'certificate')}
                        className="px-3 py-1.5 text-xs text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MSHLayout>
  );
};

export default MSHDashboard;

