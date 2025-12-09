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

  const viewFile = (fileType) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${apiUrl}/api/msh/view-file/${id}/${fileType}`, '_blank');
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
            <div className="space-y-2">
              {doctor.licenseFile && (
                <button
                  onClick={() => viewFile('license')}
                  className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  📄 View License
                </button>
              )}
              {doctor.idCardFile && (
                <button
                  onClick={() => viewFile('idCard')}
                  className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  🆔 View ID Card
                </button>
              )}
              {doctor.certificateFile && (
                <button
                  onClick={() => viewFile('certificate')}
                  className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  📜 View Certificate
                </button>
              )}
            </div>
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
      </div>
    </MSHLayout>
  );
};

export default MSHDoctorProfile;

