import React from 'react';
import CourseAd from "../../layout/CourseAd";
import CourseSection from "./CourseSection";

const HomeTab = ({ handleClassClick }) => {
  return (
    <div className="home-tab-content"> {/* Thêm một div bọc ngoài */}
      <CourseAd />
      <CourseSection
        title="Khoá học nghe đọc"
        classList={['Class A', 'Class B']}
        onClassClick={handleClassClick}
      />
      <CourseSection
        title="Khoá học nói viết"
        classList={['Class C', 'Class D']}
        onClassClick={handleClassClick}
      />
    </div>
  );
};

export default HomeTab;