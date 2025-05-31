import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import CourseAd from "../components/layout/CourseAd";
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };  

  return (
    <div>
      <Header
        role={null}
        activeTab=""
        setActiveTab={() => {}}
        onNavigateSection={scrollToSection}
      />
      
      <div className="home-container">
        <div className="home-content"> 
          <div className="home-intro">
            <h2>Chào mừng đến với EngToeic-Center!</h2>
          </div>
          <CourseAd /> 
          <div className="intro-image"></div>
          <div id="about" className="section about-section">
            <h2>About Me</h2>
            <p>Chúng tôi là trung tâm luyện thi TOEIC chuyên nghiệp...</p>
          </div>

          <div id="courses" className="section course-section">
            <h2>Courses</h2>
            <p>Danh sách các khoá học chất lượng cao đang mở...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
