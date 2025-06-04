import React, { useState, useEffect } from "react";
import Select from "react-select";

import CreateButton from "../Button/CreateButton";
import SaveButton from "../Button/SaveButton";
import CancelButton from "../Button/CancelButton";
import Table from "../Table/Table";

import "./DynamicForm.css";
import { fetchStudents, fetchTeachers } from "../../../services/personService";

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
  const [fields, setFields] = useState(formConfig.fields);

  useEffect(() => {
    const defaultData = {};
    formConfig.fields.forEach((field) => {
      if (field.type === "hidden" && field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue;
      }
    });
  
    setFormData({ ...defaultData, ...(initialData || {}) });
  }, [initialData, formConfig]);  

  // ✅ Fetch dynamic student options if needed
  useEffect(() => {
    const fetchDynamicOptions = async () => {
      const updated = await Promise.all(
        formConfig.fields.map(async (field) => {
          // ✅ Fetch học viên
          if (
            field.name === "students" &&
            field.type === "select" &&
            field.isMulti &&
            field.options.length === 0
          ) {
            try {
              const students = await fetchStudents();
              return {
                ...field,
                options: students.map((s) => ({
                  value: s.ID,
                  label: `${s.NAME} (${s.ID})`,
                  id: s.ID,
                  name: s.NAME,
                  email: s.EMAIL,
                })),
              };
            } catch (err) {
              console.error("Lỗi khi fetch học viên:", err);
            }
          }

          // ✅ Fetch giáo viên
          if (
            field.name === "teacher" &&
            field.type === "select" &&
            field.options.length === 0
          ) {
            try {
              const teachers = await fetchTeachers();
              return {
                ...field,
                options: teachers.map((t) => ({
                  value: t.ID,
                  label: `${t.NAME} (${t.ID})`,
                  id: t.ID,
                  name: t.NAME,
                  email: t.EMAIL,
                })),
              };
            } catch (err) {
              console.error("Lỗi khi fetch giáo viên:", err);
            }
          }

          return field;
        })
      );
      setFields(updated);
    };

    fetchDynamicOptions();
  }, [formConfig]);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOptions
        ? selectedOptions.map((option) => ({
            id: option.id,
            name: option.name,
            email: option.email,
          }))
        : [],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi đi:", formData);
    onSubmitSuccess(formData, !!initialData);
  };

  const renderFormField = (field) => {
    if (field.name === "status" || field.type === "hidden") return null;

    if (field.name === "hire_day" && initialData) return null;

    const value = formData[field.name];

    return (
      <div className="form-groups" key={field.name}>
        <label htmlFor={field.name} className="form-label">
          {field.label}
          {field.required && <span className="form-required"> (*) </span>}
        </label>

        {field.type === "select" ? (
          <Select
            id={field.name}
            name={field.name}
            options={field.options || []}
            isMulti={field.isMulti}
            value={
              field.isMulti
                ? (value || []).map(
                    (valItem) =>
                      field.options.find((opt) => opt.value === valItem.id) || {
                        value: valItem.id,
                        label: valItem.name,
                        ...valItem,
                      }
                  )
                : field.options.find((opt) => opt.value === value) || null
            }
            onChange={(selectedOption) => {
              if (field.isMulti) {
                handleMultiSelectChange(field.name, selectedOption);
              } else {
                handleChange(field.name, selectedOption?.value || "");
              }
            }}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        ) : field.type === "textarea" ? (
          <textarea
            id={field.name}
            name={field.name}
            rows={field.rows || 3}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className="form-input form-textarea"
          />
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.type || "text"}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className="form-input"
          />
        )}
      </div>
    );
  };

  return (
    <div className="dynamic-form-overlay">
      <form className="dynamic-form-container" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="group-with-two">
            {fields
              .filter((f) => ["name", "phone_number"].includes(f.name))
              .map(renderFormField)}
          </div>
          <div className="group-with-three">
            {fields
              .filter((f) =>
                [
                  "teacher",
                  "startDate",
                  "endDate",
                  "minStu",
                  "maxStu",
                  "price",
                ].includes(f.name)
              )
              .map(renderFormField)}
          </div>

          <div className="group-des">
            {fields
              .filter((f) => f.name === "description")
              .map(renderFormField)}
          </div>
          <div className="group-full-width">
            {fields.filter((f) => f.name === "students").map(renderFormField)}
          </div>
          <div className="group-per-info">
            {fields
              .filter((f) =>
                [
                  "date_of_birth",
                  "hire_day",
                ].includes(f.name)
              )
              .map(renderFormField)}
          </div>

          <div className="group-per-secret">
            {fields
              .filter((f) => ["email", "password"].includes(f.name))
              .map(renderFormField)}
          </div>
        </div>

        {fields.map((field) => {
          if (field.type === "select" && field.isMulti && field.displayFields) {
            const listName = field.name;
            const listItems = formData[listName] || [];

            const columns = field.displayFields.map((df) => ({
              header: df.label || df.name,
              accessor: df.name,
            }));

            return (
              <div
                key={listName}
                className="dynamic-list-section group-full-width"
              >
                {listItems.length > 0 ? (
                  <div className="dynamic-list-table-wrapper">
                    <Table columns={columns} data={listItems} />
                  </div>
                ) : (
                  <p className="dynamic-list-empty-message">
                    Chưa có học viên nào được chọn.
                  </p>
                )}
              </div>
            );
          }
          return null;
        })}

        <div className="form-actions">
          {initialData ? (
            <SaveButton type="submit">Save</SaveButton>
          ) : (
            <CreateButton type="submit" />
          )}
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
