import { NavLink, useNavigate } from 'react-router-dom';
import './SidebarSearch';

export default function SidebarStaff() {
  const navigate = useNavigate();

  const handleAddNew = () => {
    navigate('teachers/create'); // hoặc xử lý phù hợp
  };

  return (
    <aside className="sidebar-search">
      <div className="search-header">
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm" />
          <span className="icon">🔍</span>
        </div>

        <button
          className="new-button"
          onClick={handleAddNew}
          title="Thêm mới"
        >
          +Add
        </button>
      </div>

      <nav className="menu-items">
        <NavLink
          to="teachers"
          className={({ isActive }) =>
            isActive ? 'menu-item selected' : 'menu-item'
          }
        >
          Teacher
        </NavLink>

        <NavLink
          to="accountants"
          className={({ isActive }) =>
            isActive ? 'menu-item selected' : 'menu-item'
          }
        >
          Accountant
        </NavLink>
      </nav>
    </aside>
  );
}