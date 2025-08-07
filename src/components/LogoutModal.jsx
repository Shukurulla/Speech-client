import React, { useState } from "react";
import { FiLogOut, FiAlertTriangle } from "react-icons/fi";

const LogoutModal = ({ isOpen, onClose, onConfirm, userType = "student" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                userType === "admin" ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <FiLogOut
                className={`text-2xl ${
                  userType === "admin" ? "text-red-600" : "text-yellow-600"
                }`}
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Confirm Logout
          </h2>
          <p className="text-gray-600 text-center">
            Are you sure you want to log out? You'll need to sign in again to
            access your account.
          </p>
        </div>

        {/* Warning Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-3 bg-amber-50 rounded-lg p-4">
            <FiAlertTriangle className="text-amber-600 text-lg mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Before you go:</p>
              <ul className="space-y-1 text-xs">
                <li>• Make sure you've saved any progress</li>
                <li>• Your test results are automatically saved</li>
                <li>• You can continue where you left off when you return</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                userType === "admin"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
              }`}
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for using logout modal
const useLogoutModal = (userType = "student") => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleLogout = () => {
    // Remove token
    localStorage.removeItem("speech-token");

    // Redirect to login page
    window.location.href = "/login";

    closeModal();
  };

  const LogoutModalComponent = () => (
    <LogoutModal
      isOpen={isOpen}
      onClose={closeModal}
      onConfirm={handleLogout}
      userType={userType}
    />
  );

  return {
    openLogoutModal: openModal,
    LogoutModal: LogoutModalComponent,
  };
};

export default LogoutModal;
export { useLogoutModal };
