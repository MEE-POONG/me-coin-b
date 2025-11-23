import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: React.ReactNode;
}

interface ModalHeaderProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

interface ModalTitleProps {
  children: React.ReactNode;
}

interface ModalCloseProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
  Title: React.FC<ModalTitleProps>;
  Close: React.FC<ModalCloseProps>;
} = ({ open, onOpenChange, size = 'md', closeOnOverlayClick = true, closeOnEsc = true, children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!closeOnEsc || !open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, closeOnEsc, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!mounted || !open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
      />

      {/* Modal */}
      <div
        className={`relative z-50 w-full ${sizeClasses[size]} mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => (
  <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gray-50">
    {children}
  </div>
);

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <div className="p-6 overflow-y-auto flex-1">
    {children}
  </div>
);

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="p-6 border-t border-gray-200 bg-gray-50">
    {children}
  </div>
);

const ModalTitle: React.FC<ModalTitleProps> = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-900">
    {children}
  </h2>
);

const ModalClose: React.FC<ModalCloseProps> = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;
Modal.Close = ModalClose;

export default Modal;
