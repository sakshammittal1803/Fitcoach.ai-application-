import React from 'react';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-background-light dark:bg-background-dark rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-background-dark dark:text-white mb-2">
            Confirm Logout
          </h3>
          
          {/* Message */}
          <p className="text-sm text-background-dark/70 dark:text-white/70 mb-6">
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-background-dark dark:text-white bg-background-light dark:bg-background-dark border border-background-dark/20 dark:border-white/20 rounded-lg hover:bg-background-dark/5 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;