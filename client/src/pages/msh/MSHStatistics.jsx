import { useState, useEffect } from 'react';
import axios from 'axios';
import MSHLayout from '../../components/msh/MSHLayout';

const MSHStatistics = () => {
  const [stats, setStats] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [overviewRes, topDoctorsRes, chartRes] = await Promise.all([
        axios.get('/api/msh/stats/overview'),
        axios.get('/api/msh/stats/top-doctors'),
        axios.get('/api/msh/stats/prescriptions-last-week')
      ]);

      setStats(overviewRes.data.stats);
      setTopDoctors(topDoctorsRes.data.topDoctors || []);
      setChartData(chartRes.data.chartData || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
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

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 0;

  return (
    <MSHLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Statistics Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalDoctors || 0}</div>
            <div className="text-sm text-gray-600">Total Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats?.approvedDoctors || 0}</div>
            <div className="text-sm text-gray-600">Approved Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats?.pendingDoctors || 0}</div>
            <div className="text-sm text-gray-600">Pending Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats?.rejectedDoctors || 0}</div>
            <div className="text-sm text-gray-600">Rejected Doctors</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prescriptions Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Prescriptions Last 7 Days</h2>
            {chartData.length > 0 ? (
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">{item.date}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 mr-4">
                      <div
                        className="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / (maxCount || 1)) * 100}%` }}
                      >
                        <span className="text-xs text-white font-semibold">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>

          {/* Top Doctors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top 5 Most Active Doctors</h2>
            {topDoctors.length > 0 ? (
              <div className="space-y-3">
                {topDoctors.map((doctor, index) => (
                  <div key={doctor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary-600 mr-3">#{index + 1}</span>
                      <div>
                        <div className="font-medium">{doctor.firstName} {doctor.lastName}</div>
                        <div className="text-sm text-gray-500">{doctor.specialization}</div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-primary-600">
                      {doctor.prescriptionCount} prescriptions
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>
    </MSHLayout>
  );
};

export default MSHStatistics;

