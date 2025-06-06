import React, { useState, useEffect } from 'react';
import CourseAd from '../Course/CourseAd/CourseAd';
import CourseSection from '../Course/CourseSection/CourseSection';
import ClassDetail from '../ClassesTab/AdminPage/ClassDetail';
import { getOpenCoursesForHome } from '../../../services/homeService';
import { addStudentToCourse } from '../../../services/courseService';

import './HomeContent.css'

const HomeContent = ({ handleClassClick }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [openCourses, setOpenCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false); 
  const [tempStudentId, setTempStudentId] = useState(''); 
  const [tempStudentName, setTempStudentName] = useState('');

  const fetchOpenCourses = async () => {
    try {
      setLoading(true);
      const courses = await getOpenCoursesForHome();
      console.log("Fetched open courses:", courses);
      setOpenCourses(courses);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
      console.error("Error fetching open courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenCourses();
  }, []);

  const handleCourseClick = (course) => {
    console.log("Course clicked:", course);
    if (course && course.id) {
      setSelectedClass(course);
      setRegistrationError(null);
      setShowRegistrationForm(false); // Hide form when a new class is selected
      setTempStudentId(''); // Clear form fields
      setTempStudentName('');
    } else {
      console.error("Clicked course has no ID:", course);
      setSelectedClass(null);
    }
  };

  const handleInitiateRegistration = () => {
    setShowRegistrationForm(true);
    setRegistrationError(null);
  };

  const handleConfirmRegistration = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!tempStudentId || !tempStudentName) {
      setRegistrationError("Vui lòng điền đầy đủ ID và tên học viên.");
      return;
    }
    if (!selectedClass || !selectedClass.id) {
      setRegistrationError("Không có khóa học được chọn. Không thể đăng ký.");
      return;
    }

    setIsRegistering(true);
    setRegistrationError(null);
    try {
      await addStudentToCourse({ 
        studentId: tempStudentId, 
        courseId: selectedClass.id,
        paymentType: 'Chưa thanh toán',
        paymentDescription: `Đăng ký khóa học từ trang chủ bởi ${tempStudentName}`
      });
      alert(`Đăng ký khóa học thành công cho ${tempStudentName} (ID: ${tempStudentId})!`);
      setSelectedClass(null); 
      setShowRegistrationForm(false); 
      setTempStudentId('');
      setTempStudentName('');
    } catch (err) {
      setRegistrationError("Đăng ký thất bại. Vui lòng thử lại. Lỗi: " + err.message);
      console.error("Error during registration:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = () => {
    setShowRegistrationForm(false);
    setRegistrationError(null);
    setTempStudentId('');
    setTempStudentName('');
  };

  return (
    <div className="home-container">
        <div className="home-content"> 
          <div className="home-intro">
            <h2>Welcome to EngToeic-Center!</h2>          
          </div>
          
          <div className="ad-container">
            <CourseAd /> 
          </div>
          
          <div className="intro-image"></div>
          
          <div id="about" className="section about-section">
            <h2>About Me</h2>
            <p>Chúng tôi tin rằng mỗi người học là một cá thể độc đáo 
              và trải nghiệm học tập là duy nhất với từng học viên. 
              Để giúp học viên xây dựng hệ thống kiến thức và kỹ năng vững chắc, 
              có tư duy mạch lạc và ngôn ngữ thành thạo, các lớp học được xây dựng 
              trên nền tảng tiếp cận ngôn ngữ là phương tiện giao tiếp (communicative 
              approach) kết hợp tư duy phản biện (critical thinking).</p>
            
            <p>Các hoạt động trong lớp học được xây dựng bài bản theo hướng 
              tích hợp năng lực ngôn ngữ để giải quyết vấn đề (competence-based & 
              problem-based). Giáo viên sử dụng phương pháp dạy học truy 
              vấn (enquiry-based teaching), đồng thời người học được hướng dẫn 
              phương pháp tự nghiệm/ phản tỉnh (self-reflection) để biến những điều 
              học được thành năng lực của mình.</p>
          </div>
          <div className="course-intro">
            <h2>Courses</h2>
          </div> 

          <div id="courses" className="section course-section">                     
            <div className="courses-layout">
              <div className="courses-left">
                {selectedClass ?(
                  <>
                    <div className="registration-area">
                      {!showRegistrationForm ? (
                        <button
                          onClick={handleInitiateRegistration}
                          className="register-button"
                          disabled={isRegistering} // Disable if already registering (shouldn't happen here)
                        >
                          Đăng ký khóa học này
                        </button>
                      ) : (
                        <form onSubmit={handleConfirmRegistration} className="registration-form">
                          <h4>Xác nhận thông tin đăng ký:</h4>
                          <div className="form-group">
                            <label htmlFor="studentId">ID học viên:</label>
                            <input
                              type="text"
                              id="studentId"
                              value={tempStudentId}
                              onChange={(e) => setTempStudentId(e.target.value)}
                              placeholder="Nhập ID học viên"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="studentName">Tên học viên:</label>
                            <input
                              type="text"
                              id="studentName"
                              value={tempStudentName}
                              onChange={(e) => setTempStudentName(e.target.value)}
                              placeholder="Nhập tên của bạn"
                              required
                            />
                          </div>
                          {registrationError && <p className="error-message">{registrationError}</p>}
                          <button type="submit" className="confirm-register-button" disabled={isRegistering}>
                            {isRegistering ? 'Đang gửi...' : 'Xác nhận Đăng ký'}
                          </button>
                          <button type="button" className="cancel-register-button" onClick={handleCancelRegistration} disabled={isRegistering}>
                            Hủy
                          </button>
                        </form>
                      )}
                    </div>
                    <ClassDetail
                      clsId={selectedClass.id}
                      onBack={() => setSelectedClass(null)}
                    />
                  </>
                ) : (
                  <>   
                    <CourseSection
                      title="Khoá học đang mở"
                      classList={openCourses}
                      onClassClick={handleCourseClick}
                    />
                  </>
                )}                
              </div>

              <div className="courses-right">
                <div className="cefr-image"></div>
                <div className="progress-image"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HomeContent;
