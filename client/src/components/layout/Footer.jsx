import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3">PharmaCare</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted platform for finding pharmacies in Kosovo.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm md:text-base">About</h4>
            <ul className="space-y-1.5 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">For Pharmacies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm md:text-base">Contact</h4>
            <ul className="space-y-1.5 text-gray-400 text-sm">
              <li>Email: info@pharmacare.com</li>
              <li>Phone: +383 44 123 456</li>
              <li>Address: Prishtina, Kosovo</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm md:text-base">Legal</h4>
            <ul className="space-y-1.5 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-700 text-center text-gray-400 text-xs md:text-sm">
          <p>&copy; 2024 PharmaCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

