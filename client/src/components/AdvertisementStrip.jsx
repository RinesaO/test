import { useState, useEffect } from 'react';
import axios from 'axios';

const AdvertisementStrip = ({ onAdClick }) => {
  const [activeAds, setActiveAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds();
  }, []);

  useEffect(() => {
    if (activeAds.length > 0) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
      }, 4000); // Rotate every 4 seconds
      return () => clearInterval(interval);
    }
  }, [activeAds.length]);

  const fetchActiveAds = async () => {
    try {
      const response = await axios.get('/api/public/ads');
      const ads = response.data.ads || [];
      setActiveAds(ads);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading advertisements...</div>
      </div>
    );
  }

  if (activeAds.length === 0) {
    return null; // Don't show anything if no ads
  }

  const currentAd = activeAds[currentAdIndex];

  return (
    <div className="mb-6 relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-r from-primary-50 to-primary-100">
      <div className="relative h-40 md:h-48">
        {currentAd.image ? (
          <img
            src={`http://localhost:5000${currentAd.image}`}
            alt="Advertisement"
            onClick={() => onAdClick && onAdClick(currentAd)}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div
            onClick={() => onAdClick && onAdClick(currentAd)}
            className="w-full h-full bg-primary-200 flex items-center justify-center cursor-pointer hover:bg-primary-300 transition-colors"
          >
            <div className="text-center">
              <div className="text-5xl mb-2">📢</div>
              <div className="text-primary-700 font-semibold">{currentAd.offerText || 'Special Offer'}</div>
              {currentAd.pharmacyName && (
                <div className="text-sm text-primary-600 mt-1">{currentAd.pharmacyName}</div>
              )}
            </div>
          </div>
        )}
        
        {/* Ad indicator dots */}
        {activeAds.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {activeAds.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentAdIndex
                    ? 'bg-white w-6'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to advertisement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Ad label */}
        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
          AD
        </div>
      </div>
    </div>
  );
};

export default AdvertisementStrip;

