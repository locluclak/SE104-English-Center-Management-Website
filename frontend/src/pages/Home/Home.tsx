// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// import './Home.css'

// const Home = () => {
//   const navigate = useNavigate();

//   const goToLogin = () => {
//     navigate('/login');
//   };

//   const goToSignup = () => {
//     navigate('/signup');
//   };

//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };  

//   const handleClassClick = (className) => {
//     alert(`Bạn đã chọn ${className}`);
//   };  

//   return (
//     <div className="home-page">
//       <Header
//         role={null}
//         activeTab=""
//         setActiveTab={() => {}}
//         onNavigateSection={scrollToSection}
//       />
      
//       <div className="homepage-container">
//         <HomeContent handleClassClick={handleClassClick} />
//       </div>
//     </div>
//   );
// };

// export default Home;
