import { Link } from "react-router-dom";
import { useState } from "react";

export const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="  mx-auto  flex items-center  ">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-15 w-15 object-contain" />
          {/* <span className="text-lg font-semibold text-gray-800">MyApp</span> */}
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <Link to="/about" className="hover:text-green-600">About Us</Link>

          {/* Dropdown Container */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            {/* Dropdown Trigger */}
            <button className="flex items-center gap-1 hover:text-green-600 transition">
              Our Products
            </button>

            {/* Dropdown Items */}
            <div
              className={`absolute left-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 transition-all duration-200 ${
                isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              <Link
                to="/product-category/kalanamak"
                className="block px-4 py-2 text-gray-700 hover:bg-green-100 rounded-t-md"
              >
                Kalanamak
              </Link>
              <Link
                to="/product-category/foxnut"
                className="block px-4 py-2 text-gray-700 hover:bg-green-100 rounded-b-md"
              >
                Foxnut
              </Link>
            </div>
          </div>

          {/* Contact Button */}
          <Link
            to="/enquiry"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition text-sm"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </nav>
  );
};
