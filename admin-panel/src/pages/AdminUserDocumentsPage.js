import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/AdminUserDocumentsPage.css"; // Подключаем стили

function AdminUserDocumentsPage() {
    const { userId } = useParams();
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const response = await axios.get(`http://localhost:5000/api/admin/user-documents/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDocuments(response.data.documents);
            } catch (err) {
                console.error("Ошибка при загрузке документов:", err);
                setError("Не удалось загрузить документы");
            }
        };

        fetchDocuments();
    }, [userId]);

    return (
        <div className="admin-user-documents">
            <h2>Документы пользователя</h2>
            {error && <p className="error-text">{error}</p>}
            {documents.length > 0 ? (
                <div className="documents-list">
                    {documents.map((doc, index) => (
                        <div key={index} className="document-item">
                            <img src={`http://localhost:5000/uploads/upload-document/${doc}`} alt={`Документ ${index + 1}`} />
                        </div>
                    ))}
                </div>
            ) : (
                <p>Документы отсутствуют</p>
            )}
        </div>
    );
}

export default AdminUserDocumentsPage;
