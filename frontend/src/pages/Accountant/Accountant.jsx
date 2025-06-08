import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from '../../components/layout/Header/Header.jsx';

import Table from '../../components/common/Table/Table';
import Calendar from '../../components/layout/Calendar/CalendarTab';
import Padlet from '../../components/layout/Padlet/PadletTab';
import ClassesTab from '../../components/AccountantPage/TuitionFeeTab/ClassesTab';
import TimeReportTab from '../../components/AccountantPage/ReportsTab/TimeReportTab';
import ClassReportTab from '../../components/AccountantPage/ReportsTab/ClassReportTab';

import './Accountant.css';

const AccountantPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFeature, setSelectedFeature] = useState('calendar'); // Đặt mặc định cho tab dashboard
  
  const [studentsTuition, setStudentsTuition] = useState([
    { id: 'S001', name: 'Alice Nguyen', class: 'Toeic A1', totalFee: 3000000, paid: 2000000, status: 'unpaid' },
    { id: 'S002', name: 'Bob Tran', class: 'Toeic B2', totalFee: 3500000, paid: 3500000, status: 'paid' },
    { id: 'S003', name: 'Charlie Pham', class: 'IELTS C1', totalFee: 5000000, paid: 0, status: 'transfer' },
  ]);

  const prevActiveTab = useRef('dashboard');

  useEffect(() => {
    if (prevActiveTab.current !== activeTab) {
      if (activeTab === 'dashboard' && selectedFeature !== 'calendar' && selectedFeature !== 'padlet') {
        setSelectedFeature('calendar');
      } else if (activeTab === 'tuition' && selectedFeature !== 'students' && selectedFeature !== 'classes') {
        setSelectedFeature('students'); 
      } else if (activeTab === 'reports' && selectedFeature !== 'time' && selectedFeature !== 'classes') {
        setSelectedFeature('time'); 
      }
      prevActiveTab.current = activeTab;
    }
  }, [activeTab, selectedFeature]);

  const handleNew = () => {
    console.log('AccountantPage: handleNew called');
  };

  const handleFeatureSelect = useCallback((featureKey, tabKey) => {
    setSelectedFeature(featureKey);
    setActiveTab(tabKey);
  }, []);

  const studentTuitionColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Tên học viên', accessor: 'name' },
    { header: 'Lớp học', accessor: 'class' },
    { header: 'Tổng học phí', accessor: 'totalFee' },
    { header: 'Đã thanh toán', accessor: 'paid' },
    { header: 'Trạng thái', accessor: 'status' },
    {
      header: 'Hành động',
      render: (row) => (
        <div className="action-buttons">
          <button onClick={() => alert(`Xem chi tiết SV: ${row.name}`)}>Xem</button>
        </div>
      ),
    },
  ];

  const filteredStudentsTuition = studentsTuition.filter(student => {
    if (selectedFeature === 'students') return true; 

    if (selectedFeature === 'transfer') return student.status === 'transfer';
    if (selectedFeature === 'paid') return student.status === 'paid';
    if (selectedFeature === 'unpaid') return student.status === 'unpaid';
    
    return true; 
  });

  return (
    <div className="accountant-page">
      <Header 
        role="accountant" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onFeatureSelect={handleFeatureSelect} 
      />

      <div className="accountant-body"> 
        <div className="accountant-display-area">
          <div className="accountant-tab-content">
            {activeTab === 'dashboard' && (
              <>
                {selectedFeature === 'calendar' && <Calendar />}
                {selectedFeature === 'padlet' && <Padlet />}
              </>
            )}

            {activeTab === 'tuition' && (
              <>
                {selectedFeature === 'students' && (
                  <Table
                    columns={studentTuitionColumns}
                    data={filteredStudentsTuition}
                  />
                )}
                {selectedFeature === 'classes' && <ClassesTab status={selectedFeature} />}
              </>
            )}

            {activeTab === 'reports' && (
              <>
                {selectedFeature === 'time' && <TimeReportTab />}
                {selectedFeature === 'classes' && <ClassReportTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantPage;