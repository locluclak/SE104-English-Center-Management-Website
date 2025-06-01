import React, { useState, } from 'react';
import CourseAd from '../Course/CourseAd/CourseAd';
import CourseSection from '../Course/CourseSection/CourseSection';
import CourseDetail from '../Course/CourseDetail/CourseDetail';

import './HomeContent.css'

const HomeContent = ({ handleClassClick }) => {
  const [selectedClass, setSelectedClass] = useState(null);

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
                    <CourseDetail
                      className={selectedClass}
                      onBack={() => setSelectedClass(null)}
                    />
                  </>
                ) : (
                  <>                  
                    <CourseSection 
                      title="Khoá học nghe đọc"
                      classList={['Class A', 'Class B']}
                      onClassClick={setSelectedClass}
                    />
                    <CourseSection
                      title="Khoá học nói viết"
                      classList={['Class C', 'Class D']}
                      onClassClick={setSelectedClass}
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
