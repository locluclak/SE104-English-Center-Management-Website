import React, { useState } from "react";
import Card from "../../common/Card/Card";
import ClassDetail from "./ClassDetail";

const ClassesTab = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState(null);

  // Hàm trở về danh sách lớp
  const handleBack = () => {
    setSelectedClass(null);
  };

  return (
    <>
      {selectedClass ? (
        <ClassDetail
          clsId={selectedClass.id} // ✅ truyền ID để lấy API
          selectedStatus={selectedClass.status}
          onBack={handleBack}
        />
      ) : (
        <div className="class-grid">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              title={cls.name}
              onClick={() => setSelectedClass(cls)}
            >
              <p>
                <strong>ID:</strong> {cls.id}
              </p>
              <p>
                <strong>Trạng thái:</strong> {cls.status}
              </p>
              <p>
                <strong>Ngày bắt đầu:</strong> {cls.startDate}
              </p>
              <p>
                <strong>Ngày kết thúc:</strong> {cls.endDate}
              </p>
              <p>
                <strong>Mô tả:</strong> {cls.description || "Không có"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ClassesTab;
