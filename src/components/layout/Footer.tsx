import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-fuchsia-600 transition-colors">Home</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Tools</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">azPDF Desktop</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">azPDF Mobile</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">azpdfSign</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">azpdfAPI</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">azpdfIMG</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Business</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Education</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Legal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Security</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Privacy policy</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Terms & conditions</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Cookies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">About us</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Contact us</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Apps</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Google Play</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">App Store</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Mac Store</Link></li>
              <li><Link to="#" className="hover:text-fuchsia-600 transition-colors">Microsoft Store</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-fuchsia-600 p-1.5 rounded-lg flex items-center justify-center w-8 h-8 shadow-md">
              <span className="text-white font-black text-sm italic tracking-tighter">AZ</span>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-gray-900">AZ <span className="text-fuchsia-600">PDF</span></span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AZ PDF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
