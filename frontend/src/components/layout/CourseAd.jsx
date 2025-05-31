import React, { useEffect, useState } from 'react';
import './CourseAd.css';

const adTexts = [
  "Ưu đãi học phí tháng 5!",
  "Tham gia lớp luyện TOEIC 700+ hôm nay!",
  "Tặng sách khi đăng ký khoá học sớm!"
];

const CourseAd = () => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Tự động chuyển quảng cáo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % adTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToAd = (index) => {
    setCurrentAdIndex(index);
  };

  const prevAd = () => {
    setCurrentAdIndex((prevIndex) =>
      prevIndex === 0 ? adTexts.length - 1 : prevIndex - 1
    );
  };

  const nextAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % adTexts.length);
  };

  return (
    <div className="course-ad-container">
      <div className="arrow left" onClick={prevAd}>❮</div>

      <div className="course-ad">
        {adTexts[currentAdIndex]}
      </div>

      <div className="arrow right" onClick={nextAd}>❯</div>

      <div className="dot-indicators">
        {adTexts.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentAdIndex ? 'active' : ''}`}
            onClick={() => goToAd(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseAd;
