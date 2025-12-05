import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/admin/doctors/requests');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching doctor requests:', error);
      setMessage('Error fetching requests: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this doctor request?')) {
      return;
    }

    try {
      await axios.put(`/api/admin/doctors/${requestId}/approve`);
      setMessage('Doctor request approved successfully!');
      fetchRequests();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this doctor request?')) {
      return;
    }

    try {
      await axios.put(`/api/admin/doctors/${requestId}/reject`, {
        rejectionReason: rejectReason
      });
      setMessage('Doctor request rejected');
      setRejectReason('');
      setRejectingId(null);
      fetchRequests();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Requests</h1>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No pending doctor requests</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {request.firstName} {request.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">Email: {request.user?.email}</p>
                    <p className="text-sm text-gray-500">Registered: {new Date(request.user?.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    Pending Review
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Specialization:</p>
                    <p className="text-gray-900">{request.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">License Number:</p>
                    <p className="text-gray-900">{request.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone:</p>
                    <p className="text-gray-900">{request.phone}</p>
                  </div>
                  {request.address?.city && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location:</p>
                      <p className="text-gray-900">{request.address.city}</p>
                    </div>
                  )}
                </div>

                {request.bio && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Bio:</p>
                    <p className="text-gray-900">{request.bio}</p>
                  </div>
                )}

                {request.education && request.education.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Education:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {request.education.map((edu, index) => (
                        <li key={index} className="text-gray-900">
                          {edu.degree} - {edu.institution} ({edu.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.experience && request.experience.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Experience:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {request.experience.map((exp, index) => (
                        <li key={index} className="text-gray-900">
                          {exp.position} at {exp.institution} 
                          {exp.startDate && ` (${new Date(exp.startDate).toLocaleDateString()} - ${exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Approve
                  </button>
                  {rejectingId === request._id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Rejection reason (required)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleReject(request._id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(request._id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctorRequests;

