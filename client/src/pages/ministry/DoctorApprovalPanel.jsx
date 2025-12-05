import { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorApprovalPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const response = await axios.get('/api/ministry/pending-doctors');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setMessage('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await axios.post('/api/ministry/approveDoctor', { doctorId });
      setMessage('Doctor application approved successfully');
      fetchPendingApplications();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (doctorId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await axios.post('/api/ministry/rejectDoctor', { doctorId, rejectionReason: reason });
      setMessage('Doctor application rejected');
      fetchPendingApplications();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Approval Panel</h1>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No pending doctor applications</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {app.firstName} {app.lastName}
                    </h3>
                    <p className="text-gray-600 mb-1"><strong>Email:</strong> {app.user?.email}</p>
                    <p className="text-gray-600 mb-1"><strong>License Number:</strong> {app.licenseNumber}</p>
                    <p className="text-gray-600 mb-1"><strong>Specialization:</strong> {app.specialization}</p>
                    <p className="text-gray-600 mb-1"><strong>Workplace:</strong> {app.workplaceName}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Documents:</h4>
                    <div className="space-y-2">
                      {app.documents?.license && (
                        <a
                          href={`http://localhost:5000${app.documents.license}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary-600 hover:text-primary-700"
                        >
                          📄 View License
                        </a>
                      )}
                      {app.documents?.idCard && (
                        <a
                          href={`http://localhost:5000${app.documents.idCard}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary-600 hover:text-primary-700"
                        >
                          🆔 View ID Card
                        </a>
                      )}
                      {app.documents?.certificate && (
                        <a
                          href={`http://localhost:5000${app.documents.certificate}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary-600 hover:text-primary-700"
                        >
                          📜 View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleApprove(app._id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app._id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorApprovalPanel;

