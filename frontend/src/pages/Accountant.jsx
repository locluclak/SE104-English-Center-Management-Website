import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SidebarSearch from '../components/SidebarSearch';

import Calendar from '../components/DashboardTab/CalendarTab';
import Padlet from '../components/DashboardTab/PadletTab';

import './Accountant.css';

const AccountantPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('home');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setSelectedFeature('calendar');
    } else if (activeTab === 'tuition') {
      setSelectedFeature('student');
    } else if (activeTab === 'payments') {
      setSelectedFeature('transfer');
    } else if (activeTab === 'reports') {
      setSelectedFeature('time')
    }
  }, [activeTab]);

  const handleNew = () => {
    console.log('AccountantPage: handleNew called');
  };

  const handleFeatureSelect = (featureKey) => {
    setSelectedFeature(featureKey);
  };

  return (
    <div className="accountant-page">
      <Navbar role="accountant" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="accountant-content">
        <SidebarSearch
          role="accountant"
          activeTab={activeTab}
          onSearch={handleFeatureSelect}
          onNew={handleNew}
        />

        <div className="content">
          {activeTab === 'dashboard' && (
            <div>
              {selectedFeature === 'calendar' && <Calendar />}
              {selectedFeature === 'padlet' && <Padlet />}
            </div>
          )}
        

        </div>
      </div>
    </div>
  );
};

export default AccountantPage;