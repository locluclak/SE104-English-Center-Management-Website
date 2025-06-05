import React, { useState, useEffect } from 'react';
import CourseSection from "../../Course/CourseSection/CourseSection";
import { getCoursesByStudentId } from '../../../../services/courseService'; 

const MyCoursesTab = ({ studentId, handleClassClick }) => { 
    const [currentCourses, setCurrentCourses] = useState([]);
    const [endedCourses, setEndedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!studentId) {
                setLoading(false);
                console.warn("Student ID is not provided for MyCoursesTab.");
                return;
            }

            try {
                const studentCourses = await getCoursesByStudentId(studentId);

                const now = new Date();
                const current = [];
                const ended = [];

                studentCourses.forEach(course => {
                    const formattedCourse = {
                        id: course.COURSE_ID,
                        name: course.NAME,
                        description: course.DESCRIPTION,
                        price: course.PRICE,
                        teacherName: 'Chưa cập nhật',
                        status: course.PAYMENT_STATUS,
                        startDateFormatted: new Date(course.START_DATE).toLocaleDateString(),
                        endDateFormatted: new Date(course.END_DATE).toLocaleDateString(),
                    };

                    const courseEndDate = new Date(course.END_DATE);
                    if (courseEndDate < now) {
                        ended.push(formattedCourse);
                    } else {
                        current.push(formattedCourse);
                    }                    
                });

                setCurrentCourses(current);
                setEndedCourses(ended);
            } catch (error) {
                console.error('Error loading courses for student:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [studentId]); 

    if (loading) return <p>Đang tải dữ liệu lớp học...</p>;

    return (
        <>
            <CourseSection
                title="Lớp học đang tham gia"
                classList={currentCourses}
                onClassClick={(course) => handleClassClick(course.id)} 
            />

            <CourseSection
                title="Lớp học đã kết thúc"
                classList={endedCourses}
                onClassClick={(course) => handleClassClick(course.id)} 
            />
        </>
    );
};

export default MyCoursesTab;