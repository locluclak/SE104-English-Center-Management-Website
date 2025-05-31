import React from 'react';
import {
  FaHome, FaBookOpen, FaCalendarAlt, FaStickyNote, FaChild,
  FaMoneyCheckAlt, FaFileInvoiceDollar, FaRegClock, FaReceipt,
  FaHourglassEnd, FaHourglassHalf, FaSpinner,
} from 'react-icons/fa';

export const itemsByRole = {
  admin: {
    classes: [
      { key: 'waiting', name: 'Waiting', icon: <FaSpinner /> },
      { key: 'current', name: 'Current', icon: <FaHourglassHalf /> },
      { key: 'end', name: 'End', icon: <FaHourglassEnd /> },
    ],
    students: [
      { key: 'all', name: 'View All' },
      { key: 'enrolled', name: 'Enrolled' },
      { key: 'unenroll', name: 'Unenroll' },
    ],
    staffs: [
      { key: 'teacher', name: 'Teacher' },
      { key: 'accountant', name: 'Accountant' },
    ],
  },
  teacher: {
    classes: [
      { key: 'current', name: 'Current', icon: <FaHourglassHalf /> },
      { key: 'end', name: 'End', icon: <FaHourglassEnd /> },
    ],
    dashboard: [
      { key: 'calendar', name: 'Calendar', icon: <FaCalendarAlt /> },
      { key: 'padlet', name: 'Padlet', icon: <FaStickyNote /> },
    ],
  },
  student: {
    home: [
      { key: 'home', name: 'Home', icon: <FaHome /> },
    ],
    courses: [
      { key: 'my-courses', name: 'My Courses', icon: <FaBookOpen /> },
    ],
    dashboard: [
      { key: 'calendar', name: 'Calendar', icon: <FaCalendarAlt /> },
      { key: 'padlet', name: 'Padlet', icon: <FaStickyNote /> },
    ],
  },
  accountant: {
    dashboard: [
      { key: 'calendar', name: 'Calendar', icon: <FaCalendarAlt /> },
      { key: 'padlet', name: 'Padlet', icon: <FaStickyNote /> },
    ],
    tuition: [
      { key: 'students', name: 'Students', icon: <FaChild /> },
      { key: 'classes', name: 'Classes', icon: <FaBookOpen /> },
    ],
    reports: [
      { key: 'time', name: 'Time', icon: <FaRegClock /> },
      { key: 'classes', name: 'Classes', icon: <FaBookOpen /> },
    ],
  },
};

export const paymentSubItems = [
  { key: 'transfer', name: 'Transfer', icon: <FaMoneyCheckAlt /> },
  { key: 'paid', name: 'Paid', icon: <FaFileInvoiceDollar /> },
  { key: 'unpaid', name: 'Unpaid', icon: <FaReceipt /> },
];
