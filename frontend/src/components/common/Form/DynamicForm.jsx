import React, { useState, useEffect } from 'react';
import './DynamicForm.css';

const DynamicForm = ({ formConfig, initialData, onClose, onSubmitSuccess }) => {
  if (!formConfig) {
    console.error("DynamicForm: No formConfig provided.");
    return (
      <div className="form-error-message">
        Không tìm thấy cấu hình form. Vui lòng kiểm tra lại.
      </div>
    );
  }

  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData, formConfig]);

  const handleChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDynamicListChange = (listName, index, fieldName, value) => {
    setFormData(prevData => {
      const currentList = prevData[listName] ? [...prevData[listName]] : [];
      currentList[index] = { ...currentList[index], [fieldName]: value };
      return { ...prevData, [listName]: currentList };
    });
  };

  const handleAddDynamicListItem = (listName, defaultItem) => {
    setFormData(prevData => {
      const currentList = prevData[listName] ? [...prevData[listName]] : [];
      return { ...prevData, [listName]: [...currentList, { ...defaultItem }] };
    });
  };

  const handleRemoveDynamicListItem = (listName, indexToRemove) => {
    setFormData(prevData => {
      const currentList = prevData[listName] ? [...prevData[listName]] : [];
      return {
        ...prevData,
        [listName]: currentList.filter((_, idx) => idx !== indexToRemove)
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onSubmitSuccess(formData, !!initialData);
  };

  return (
    <div className="dynamic-form-overlay">
      <form className="dynamic-form-container" onSubmit={handleSubmit}>
        <div className="form-grid">
          {formConfig.fields.map((field) => {
            if (field.type === 'dynamicList') {
              return null;
            }

            return (
              <div className="form-group" key={field.name}>
                <label htmlFor={field.name} className="form-label">
                  {field.label}
                  {field.required && <span className="form-required">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={field.rows || 3}
                    placeholder={field.placeholder || ''}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="form-input form-textarea"
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="form-input form-select"
                  >
                    <option value="">-- Chọn {field.label} --</option>
                    {field.options && field.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="form-input"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Render dynamicList fields (ví dụ: students) */}
        {formConfig.fields.map(field => {
          if (field.type === 'dynamicList') {
            const listName = field.name; // Ví dụ: 'students'
            const listItems = formData[listName] || [];
            const defaultNewItem = field.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

            return (
              <div key={listName} className="dynamic-list-section">
                <div className="dynamic-list-header">
                  <label className="dynamic-list-label">{field.label}</label>
                  <button
                    type="button"
                    onClick={() => handleAddDynamicListItem(listName, defaultNewItem)}
                    className="btn btn-add-item"
                  >
                    Thêm {field.label.slice(0, -1)}
                  </button>
                </div>
                {listItems.length > 0 ? (
                  <div className="dynamic-list-table-wrapper">
                    <table className="dynamic-list-table">
                      <thead>
                        <tr>
                          {field.fields.map((f, i) => (
                            <th key={i}>{f.placeholder || f.name}</th>
                          ))}
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listItems.map((item, idx) => (
                          <tr key={idx}>
                            {field.fields.map((f) => (
                              <td key={f.name}>
                                <input
                                  type={f.type || 'text'}
                                  value={item[f.name] || ''}
                                  onChange={(e) => handleDynamicListChange(listName, idx, f.name, e.target.value)}
                                  placeholder={f.placeholder || ''}
                                  className="dynamic-list-input"
                                />
                              </td>
                            ))}
                            <td>
                              <button
                                type="button"
                                onClick={() => handleRemoveDynamicListItem(listName, idx)}
                                className="btn btn-remove-item"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="dynamic-list-empty-message">Chưa có mục nào được thêm.</p>
                )}
              </div>
            );
          }
          return null;
        })}


        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
          >
            {initialData ? 'Cập nhật' : 'Tạo mới'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
