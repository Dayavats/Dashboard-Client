import React, { useEffect, useRef } from "react";

const Modal = ({ open, onClose, title, width = 480, children }) => {
  const modalRef = useRef();
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus();
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.3)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: width, boxShadow: '0 2px 16px #0002' }}>
        {title && <h2>{title}</h2>}
        {children}
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <button onClick={onClose} aria-label="Close modal">Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
