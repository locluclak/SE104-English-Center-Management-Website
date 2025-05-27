import React, { useState } from 'react';
import DocumentForm from './DocumentForm';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const handleAddDocument = (doc) => {
    if (editingDocument) {
      // Edit mode: cập nhật bài cũ
      const updated = document.map(item =>
        item.id === editingDocument.id ? { ...item, ...doc } : item
      );
      setDocument(updated);
      setEditingDocument(null);
    } else {
      // Add mode: thêm mới
      setDocuments([...documents, { id: documents.length + 1, ...doc }]);
    }
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(true)}>+ Thêm tài liệu</button>

      {showForm && <DocumentForm onSubmit={handleAddDocument} />}

      <table className="custom-table">
        <thead>
          <tr>
            <th>NO.</th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, idx) => (
            <tr key={doc.id}>
              <td>{idx + 1}</td>
              <td>{doc.title}</td>
              <td dangerouslySetInnerHTML={{ __html: doc.description }}></td>
              <td>
                <button onClick={() => {
                  setEditingAssignment(doc);
                  setShowForm(true);
                }}>
                  Edit
                </button>

                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;
