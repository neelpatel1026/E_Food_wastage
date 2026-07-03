import React from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-12 px-6 mt-auto border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <h2 
            className="text-2xl font-extrabold text-orange-500 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Rebite
          </h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Reducing food wastage by connecting restaurants with hungry customers. Enjoy delicious meals at premium discounts while contributing to a sustainable future.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-white font-bold text-base">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="hover:text-orange-500 cursor-pointer transition" onClick={() => navigate("/")}>
                Home / Dashboard
              </span>
            </li>
            <li>
              <span className="hover:text-orange-500 cursor-pointer transition" onClick={() => navigate("/my-orders")}>
                My Orders
              </span>
            </li>
            <li>
              <span className="hover:text-orange-500 cursor-pointer transition" onClick={() => navigate("/cart")}>
                Shopping Cart
              </span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h3 className="text-white font-bold text-base">Contact Us</h3>
          <p className="text-sm leading-relaxed">
            Have questions or feedback? Feel free to reach out to our support team.
          </p>
          <div className="text-sm text-gray-300">
            Email: <span className="text-orange-500">support@rebite.org</span>
          </div>
        </div>

        {/* Social */}
        <div className="flex flex-col gap-3">
          <h3 className="text-white font-bold text-base">Follow Us</h3>
          <p className="text-sm">Stay connected on our social channels for updates and fresh deals.</p>
          <div className="flex items-center gap-4 text-xl mt-1">
            <a href="https://instagram.com" className="hover:text-orange-500 text-gray-400 transition" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" className="hover:text-orange-500 text-gray-400 transition" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
            <a href="https://facebook.com" className="hover:text-orange-500 text-gray-400 transition" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between gap-4">
        <span>© {new Date().getFullYear()} Rebite Inc. All Rights Reserved.</span>
        <div className="flex justify-center gap-4">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
