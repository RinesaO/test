import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PrescriptionPrintView = ({ prescription }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hidden print:block print:p-8">
      <div className="print:mb-6">
        <h1 className="text-2xl font-bold mb-4">Prescription</h1>
        <div className="space-y-2 text-sm">
          <p><strong>Prescription Number:</strong> {prescription.prescriptionNumber}</p>
          <p><strong>Date Issued:</strong> {new Date(prescription.dateIssued).toLocaleDateString()}</p>
          {prescription.expiryDate && (
            <p><strong>Expiry Date:</strong> {new Date(prescription.expiryDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <p className="font-semibold">Doctor:</p>
          <p>{prescription.doctor?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600">{prescription.doctor?.email || 'N/A'}</p>
        </div>

        <div>
          <p className="font-semibold">Patient:</p>
          <p>{prescription.patientName} (ID: {prescription.patientID})</p>
          <p className="text-sm text-gray-600">{prescription.patient?.email || 'N/A'}</p>
        </div>

        <div>
          <p className="font-semibold">Diagnosis:</p>
          <p>{prescription.diagnosis}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="font-semibold mb-2">Medications:</p>
        <ul className="space-y-3">
          {prescription.medications.map((med, index) => (
            <li key={index} className="border-b pb-2">
              <p className="font-medium">{med.name}</p>
              <p className="text-sm">Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}</p>
              {med.instructions && (
                <p className="text-sm text-gray-600 mt-1">Instructions: {med.instructions}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {prescription.notes && (
        <div className="mb-6">
          <p className="font-semibold">Notes:</p>
          <p>{prescription.notes}</p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t text-xs text-gray-500">
        <p>This is a digital prescription. Please present this to your pharmacy.</p>
      </div>
    </div>
  );
};

const Prescriptions = () => {
  const { user, isDoctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const endpoint = isDoctor ? '/api/prescriptions' : '/api/prescriptions/my-prescriptions';
      const response = await axios.get(endpoint);
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = (prescription) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription ${prescription.prescriptionNumber}</title>
          <style>
            @media print {
              @page {
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.6;
              }
              .no-print {
                display: none;
              }
            }
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              font-size: 14pt;
              margin-bottom: 5px;
            }
            .medication-item {
              border-bottom: 1px solid #ddd;
              padding: 10px 0;
            }
            .medication-name {
              font-weight: bold;
              font-size: 13pt;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 10pt;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Prescription</h1>
          
          <div class="section">
            <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
            <p><strong>Date Issued:</strong> ${new Date(prescription.dateIssued).toLocaleDateString()}</p>
            ${prescription.expiryDate ? `<p><strong>Expiry Date:</strong> ${new Date(prescription.expiryDate).toLocaleDateString()}</p>` : ''}
            <p><strong>Status:</strong> ${prescription.status.toUpperCase()}</p>
          </div>

          <div class="section">
            <p class="section-title">Doctor Information:</p>
            <p>${prescription.doctor?.name || 'N/A'}</p>
            <p>${prescription.doctor?.email || 'N/A'}</p>
          </div>

          <div class="section">
            <p class="section-title">Patient Information:</p>
            <p>${prescription.patientName} (ID: ${prescription.patientID})</p>
            <p>${prescription.patient?.email || 'N/A'}</p>
          </div>

          <div class="section">
            <p class="section-title">Diagnosis:</p>
            <p>${prescription.diagnosis}</p>
          </div>

          <div class="section">
            <p class="section-title">Medications:</p>
            ${prescription.medications.map((med, index) => `
              <div class="medication-item">
                <p class="medication-name">${med.name}</p>
                <p>Dosage: ${med.dosage} | Frequency: ${med.frequency} | Duration: ${med.duration}</p>
                ${med.instructions ? `<p style="margin-top: 5px; color: #555;">Instructions: ${med.instructions}</p>` : ''}
              </div>
            `).join('')}
          </div>

          ${prescription.notes ? `
            <div class="section">
              <p class="section-title">Notes:</p>
              <p>${prescription.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is a digital prescription. Please present this to your pharmacy.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isDoctor ? 'My Prescriptions' : 'My Prescriptions'}
          </h1>
          {isDoctor && (
            <Link
              to="/dashboard/create-prescription"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              + Create Prescription
            </Link>
          )}
        </div>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No prescriptions found</p>
            {isDoctor && (
              <Link
                to="/dashboard/create-prescription"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first prescription
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Prescription #{prescription.prescriptionNumber}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(prescription.dateIssued).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(prescription.status)}`}>
                      {prescription.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handlePrint(prescription)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium print:hidden"
                      title="Print Prescription"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {isDoctor ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Patient:</p>
                        <p className="text-gray-900">{prescription.patientName} (ID: {prescription.patientID})</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Patient Email:</p>
                        <p className="text-gray-900">{prescription.patient?.email || 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Doctor:</p>
                        <p className="text-gray-900">{prescription.doctor?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Doctor Email:</p>
                        <p className="text-gray-900">{prescription.doctor?.email || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                    <p className="text-gray-900">{prescription.diagnosis}</p>
                  </div>
                  {prescription.expiryDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Expiry Date:</p>
                      <p className="text-gray-900">{new Date(prescription.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Medications:</p>
                  <ul className="space-y-2">
                    {prescription.medications.map((med, index) => (
                      <li key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-500 mt-1">Instructions: {med.instructions}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {prescription.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                    <p className="text-gray-900">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;

