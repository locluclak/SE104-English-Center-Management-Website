// src/CourseList.jsx
import { useEffect, useState } from "react";

function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/courses")
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div>
      <h2>Danh sách khóa học</h2>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            {course.title} ({course.level})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
