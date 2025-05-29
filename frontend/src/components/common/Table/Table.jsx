import React from 'react';
import './Table.css'; // Import CSS cho bảng

const Table = ({ columns, data }) => {
  if (!data || data.length === 0) {
    return <p>Không có dữ liệu để hiển thị.</p>;
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {/* Nếu có hàm render, sử dụng nó, ngược lại hiển thị giá trị trực tiếp */}
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;