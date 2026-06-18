import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaUserShield, FaLock, FaCheck } from 'react-icons/fa';

interface DisableAccountConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  userEmail?: string;
}

const DisableAccountConfirmationModal: React.FC<DisableAccountConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'this account',
  userEmail,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset confirmation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Disable Account</h2>
              <p className="text-red-100 text-sm mt-1">Irreversible action required</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaLock className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-semibold text-sm">
                  This action cannot be reversed automatically
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Once disabled, the account will lose all access to the system immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          {userEmail && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">Account:</span> {userName}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <span className="font-semibold">Email:</span> {userEmail}
              </p>
            </div>
          )}

          {/* Reactivation Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaUserShield className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-semibold text-sm">
                  Reactivation requires super user assistance
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  To reactivate this account, the user must contact a person with 
                  super user rights for manual restoration.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Check */}
          <div 
            onClick={() => setIsConfirmed(!isConfirmed)}
            className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isConfirmed 
                ? 'bg-green-50 border-green-400' 
                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isConfirmed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-gray-400'
            }`}>
              {isConfirmed && <FaCheck className="text-xs" />}
            </div>
            <div>
              <p className={`font-semibold text-sm ${
                isConfirmed ? 'text-green-800' : 'text-amber-800'
              }`}>
                I understand the consequences
              </p>
              <p className={`text-sm mt-1 ${
                isConfirmed ? 'text-green-700' : 'text-amber-700'
              }`}>
                This action is irreversible. Reactivation requires super user intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all transform hover:scale-105 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          >
            Disable Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisableAccountConfirmationModal;