import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import SidebarSearch from '../components/layout/SidebarSearch';

import Calendar from '../components/DashboardTab/CalendarTab';
import Padlet from '../components/DashboardTab/PadletTab';

import StudentsTab from '../components/AccountantPage/TuitionFeeTab/StudentsTab';
import ClassesTab from '../components/AccountantPage/TuitionFeeTab/ClassesTab';

import './Accountant.css';

const AccountantPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFeature, setSelectedFeature] = useState('calendar'); // default for dashboard
  const [tuitionSubTab, setTuitionSubTab] = useState('students'); // 'students' or 'classes'

  const prevActiveTab = useRef('dashboard');

  useEffect(() => {
    if (prevActiveTab.current !== activeTab) {
      if (activeTab === 'dashboard') {
        setSelectedFeature('calendar');
      } else if (activeTab === 'tuition') {
        setTuitionSubTab('students');
        setSelectedFeature('transfer'); // default submenu for students
      } else if (activeTab === 'reports') {
        setSelectedFeature('time');
      }
      prevActiveTab.current = activeTab;
    }
  }, [activeTab]);

  const handleNew = () => {
    console.log('AccountantPage: handleNew called');
  };

  const handleFeatureSelect = (featureKey) => {
    if (featureKey === 'students' || featureKey === 'classes') {
      setTuitionSubTab(featureKey);
      // Không set lại selectedFeature ở đây nếu đã được chọn trước đó
      if (featureKey === 'students' && tuitionSubTab !== 'students') {
        setSelectedFeature('transfer');
      } else if (featureKey === 'classes' && tuitionSubTab !== 'classes') {
        setSelectedFeature('current'); // bạn có thể đổi tùy logic
      }
    } else {
      setSelectedFeature(featureKey);
    }
  };

  return (
    <div className="accountant-page">
      <Header role="accountant" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="accountant-content">
        <SidebarSearch
          role="accountant"
          activeTab={activeTab}
          onSearch={handleFeatureSelect}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'dashboard' && (
            <>
              {selectedFeature === 'calendar' && <Calendar />}
              {selectedFeature === 'padlet' && <Padlet />}
            </>
          )}

          {activeTab === 'tuition' && (
            <>
              {tuitionSubTab === 'classes' && <ClassesTab status={selectedFeature} />}
              {tuitionSubTab === 'students' && <StudentsTab status={selectedFeature} />}
            </>
          )}

          {activeTab === 'reports' && (
            <>
              {selectedFeature === 'time' && <div>Reports - Time (add component here)</div>}
              {selectedFeature === 'classes' && <div>Reports - Classes (add component here)</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantPage;
