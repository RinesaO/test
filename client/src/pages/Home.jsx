import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Nearest Pharmacy in Kosovo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with trusted pharmacies and discover products near you
            </p>
            <Link
              to="/pharmacies"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
            >
              Find a Pharmacy
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose PharmaCare?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-3">Easy Location</h3>
              <p className="text-gray-600">
                Find pharmacies near you with detailed location information and contact details.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">💊</div>
              <h3 className="text-xl font-semibold mb-3">Product Catalog</h3>
              <p className="text-gray-600">
                Browse products from each pharmacy and check availability before visiting.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-3">Opening Hours</h3>
              <p className="text-gray-600">
                Check pharmacy opening hours and plan your visit accordingly.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3">Verified Pharmacies</h3>
              <p className="text-gray-600">
                All listed pharmacies are verified and actively subscribed to our platform.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">Easy Contact</h3>
              <p className="text-gray-600">
                Direct contact information to reach out to pharmacies quickly.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">Smart Search</h3>
              <p className="text-gray-600">
                Search by name, location, or product to find exactly what you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Search</h3>
              <p className="text-gray-600">
                Browse our directory of verified pharmacies or search by location
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Explore</h3>
              <p className="text-gray-600">
                View pharmacy profiles, products, services, and opening hours
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Contact</h3>
              <p className="text-gray-600">
                Reach out to the pharmacy directly using provided contact information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Pharmacy?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Start browsing our directory of trusted pharmacies
          </p>
          <Link
            to="/pharmacies"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            Browse Pharmacies
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

