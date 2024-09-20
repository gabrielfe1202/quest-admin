import type React from 'react';
import { useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    return (
        <>
            {isOpen && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ zIndex: 99999 }}
                    onClick={onClose}
                >
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                    <div
                        className="bg-white rounded-lg  pt-3 p-6 shadow-lg transform transition-transform duration-300 max-w-2xl w-full mx-auto"
                        onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar dentro do modal
                        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
                    >
                        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                        <button
                            className="absolute top-3 right-5 text-gray-600 font-bold hover:text-gray-800"                            
                            onClick={onClose}
                        >
                            &#10005;
                        </button>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
