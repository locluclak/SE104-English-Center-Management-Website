import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/Ui/Card/card";
import { Button } from "@/components/Ui/Button/button";
import { Badge } from "@/components/Ui/Badge/badge";
import { BookOpen, Users, Calendar, ArrowRight, } from "@/components/Ui/Icons/icons";
import { MainApiRequest } from "@/services/MainApiRequest";
import { message } from "antd";
import { useSystemContext } from "@/hooks/useSystemContext";

interface EnrolledCourse {
  id: string;
  name: string;
  description: string;
  instructor: string;
  schedule: string;
  progress: number;
  status: "active" | "completed" | "upcoming";
  nextClass?: string;
}

const getCourseStatus = (
  startDate: string,
  endDate: string
): "active" | "completed" | "upcoming" => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
};

const fetchTeacher = async (courseId: string): Promise<string> => {
  try {
    const { data } = await MainApiRequest.get(`/course/teacher/${courseId}`);
    return data?.[0]?.NAME || "N/A";
  } catch (err) {
    console.error("Failed to fetch teacher", err);
    return "N/A";
  }
};

const StudentCourses: React.FC = () => {
  const navigate = useNavigate();
  const { token, userId } = useSystemContext();

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const studentId = userId || localStorage.getItem("userId");
    if (!studentId) return;

    (async () => {
      try {
        const { data } = await MainApiRequest.get(
          `/course/enrolled-courses/${studentId}`
        );
        const rawCourses = data.courses || [];

        const mapped: EnrolledCourse[] = await Promise.all(
          rawCourses.map(async (c: any) => {
            const teacher = await fetchTeacher(c.COURSE_ID);
            const cleanDesc = c.DESCRIPTION?.replace(/^[\[\(]Giáo viên:.*?[\]\)]\s*/, "");
            const status = getCourseStatus(c.START_DATE, c.END_DATE);
            const progress = status === "completed" ? 100 : status === "active" ? 50 : 0; // demo logic

            return {
              id: c.COURSE_ID,
              name: c.NAME,
              description: cleanDesc || "",
              instructor: teacher,
              schedule: `${new Date(c.START_DATE).toLocaleDateString("vi-VN")} - ${new Date(
                c.END_DATE
              ).toLocaleDateString("vi-VN")}`,
              progress,
              status,
            } as EnrolledCourse;
          })
        );

        setEnrolledCourses(mapped);
      } catch (err) {
        console.error("Failed to fetch enrolled courses", err);
        message.error("Không thể tải danh sách khoá học đã đăng ký.");
      }
    })();
  }, [userId]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "completed":
        return "status-completed";
      case "upcoming":
        return "status-upcoming";
      default:
        return "";
    }
  };

  return (
    <div className="student-courses">
      <div className="page-header">
        <h1>My Courses</h1>
        <Badge variant="secondary">
          {enrolledCourses.filter((c) => c.status === "active").length} Active
          Courses
        </Badge>
      </div>

      <div className="courses-grid">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="course-card">
            <CardHeader>
              <div className="course-header">
                <div className="course-title-section">
                  <BookOpen className="icon" />
                  <CardTitle>{course.name}</CardTitle>
                </div>
                <Badge className={statusColor(course.status)}>
                  {course.status}
                </Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>

            <CardContent className="course-content">
              <div className="course-details">
                <div className="detail-item">
                  <Users className="icon" />
                  <span>Instructor: {course.instructor}</span>
                </div>
                <div className="detail-item">
                  <Calendar className="icon" />
                  <span>{course.schedule}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <Button
                className="view-course-btn"
                onClick={() => handleCourseClick(course.id)}
              >
                <span>View Course</span>
                <ArrowRight className="icon" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h3>No courses enrolled</h3>
          <p>Visit the home page to browse and enroll in available courses.</p>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
