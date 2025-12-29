import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MSHLayout from '../../components/msh/MSHLayout';

const MSHDoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`/api/msh/doctor/${id}`);
      setDoctor(response.data.doctor);
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewFile = async (fileType) => {
    try {
      const response = await axios.get(`/api/msh/view-file/${id}/${fileType}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
    }
  };

  const downloadFile = async (fileType) => {
    try {
      const response = await axios.get(`/api/msh/download-file/${id}/${fileType}`, {
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

  if (!doctor) {
    return (
      <MSHLayout>
        <div className="p-8">
          <p className="text-gray-500">Doctor not found</p>
        </div>
      </MSHLayout>
    );
  }

  return (
    <MSHLayout>
      <div className="p-8">
        <button
          onClick={() => navigate('/msh-doctors')}
          className="mb-4 text-primary-600 hover:text-primary-800"
        >
          ← Back to All Doctors
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Doctor Profile: {doctor.firstName} {doctor.lastName}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Doctor Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Full Name:</span> {doctor.firstName} {doctor.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {doctor.user?.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Specialization:</span> {doctor.specialization}
              </div>
              <div>
                <span className="font-medium">License Number:</span> {doctor.licenseNumber}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {doctor.phone}
              </div>
              <div>
                <span className="font-medium">Workplace:</span> {doctor.workplaceName}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  doctor.status === 'approved' ? 'bg-green-100 text-green-800' :
                  doctor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {doctor.status}
                </span>
              </div>
              <div>
                <span className="font-medium">Date Joined:</span> {formatDate(doctor.createdAt)}
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">Documents</h3>
            {(doctor.licenseFile || doctor.idCardFile || doctor.certificateFile) && (
              <button
                onClick={() => setShowDocumentModal(true)}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
              >
                View Documents
              </button>
            )}
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Prescriptions ({prescriptions.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {prescriptions.length === 0 ? (
                <p className="text-gray-500">No prescriptions found</p>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription._id} className="border border-gray-200 rounded p-3">
                    <div className="font-medium">#{prescription.prescriptionNumber}</div>
                    <div className="text-sm text-gray-600">
                      Patient: {prescription.patientName}
                    </div>
                    <div className="text-sm text-gray-600">
                      Date: {formatDate(prescription.dateIssued)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Diagnosis: {prescription.diagnosis}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Document Modal */}
        {showDocumentModal && (
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
                {doctor.licenseFile && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="text-sm font-medium text-gray-700">License</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewFile('license')}
                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadFile('license')}
                        className="px-3 py-1.5 text-xs text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {doctor.idCardFile && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="text-sm font-medium text-gray-700">ID Card</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewFile('idCard')}
                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadFile('idCard')}
                        className="px-3 py-1.5 text-xs text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {doctor.certificateFile && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <span className="text-sm font-medium text-gray-700">Certificate</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewFile('certificate')}
                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadFile('certificate')}
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

export default MSHDoctorProfile;

