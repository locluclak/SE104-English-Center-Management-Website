import SidebarStaff from '../../components/SidebarStaff';
import { Outlet } from 'react-router-dom';

export default function StaffLayout() {
  return (
    <div className="flex h-full">
      <SidebarStaff />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}