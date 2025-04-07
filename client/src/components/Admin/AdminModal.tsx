import React from 'react';

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  footerContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-90"
        onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 z-10">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="p-6">{children}</div>
        {footerContent && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
