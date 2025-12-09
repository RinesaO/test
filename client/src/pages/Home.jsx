import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.findNearestPharmacy')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {t('home.connectWithPharmacies')}
            </p>
            <Link
              to="/pharmacies"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
            >
              {t('home.findPharmacy')}
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('home.whyChoose')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-3">{t('home.easyLocation')}</h3>
              <p className="text-gray-600">
                {t('home.easyLocationDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">💊</div>
              <h3 className="text-xl font-semibold mb-3">{t('home.productCatalog')}</h3>
              <p className="text-gray-600">
                {t('home.productCatalogDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-3">{t('home.openingHours')}</h3>
              <p className="text-gray-600">
                {t('home.openingHoursDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3">{t('home.verifiedPharmacies')}</h3>
              <p className="text-gray-600">
                {t('home.verifiedPharmaciesDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">{t('home.easyContact')}</h3>
              <p className="text-gray-600">
                {t('home.easyContactDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">{t('home.smartSearch')}</h3>
              <p className="text-gray-600">
                {t('home.smartSearchDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('home.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.search')}</h3>
              <p className="text-gray-600">
                {t('home.searchDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.explore')}</h3>
              <p className="text-gray-600">
                {t('home.exploreDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.contact')}</h3>
              <p className="text-gray-600">
                {t('home.contactDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('home.readyToFind')}</h2>
          <p className="text-xl mb-8 text-primary-100">
            {t('home.startBrowsing')}
          </p>
          <Link
            to="/pharmacies"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            {t('home.browsePharmacies')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

