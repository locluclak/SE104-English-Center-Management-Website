import StaffLayout from './Layout/Stafflayout';
import TeacherList from './pages/admin/staff/TeacherList';
import AccountantList from './pages/admin/staff/AccountantList';

export const routes = [
  {
    path: '/admin/staff',
    element: <StaffLayout />,
    children: [
      { index: true, element: <TeacherList /> },
      { path: 'teachers', element: <TeacherList /> },
      { path: 'accountants', element: <AccountantList /> },
    ]
  },
  // ...other routes
];