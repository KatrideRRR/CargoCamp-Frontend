import React, { useContext } from 'react';
import { ModalContext } from '../utils/modalContext';
import '../styles/Modal.css';

const Modal = () => {
    const { isModalOpen, modalContent, closeModal } = useContext(ModalContext);

    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{modalContent.title}</h2>
                <p>{modalContent.description}</p>
                <div className="modal-buttons">
                    {modalContent.onConfirm && (
                        <button className="approve-button" onClick={modalContent.onConfirm}>
                            Одобрить
                        </button>
                    )}
                    {modalContent.onCancel && (
                        <button className="reject-button" onClick={modalContent.onCancel}>
                            Отклонить
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
