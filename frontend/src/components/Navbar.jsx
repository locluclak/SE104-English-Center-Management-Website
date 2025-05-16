// components/Navbar.jsx
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ role, links, activeTab, setActiveTab }) => {
  const getLogoName = () => {
    switch (role) {
      case 'admin':
        return 'EngToeic Admin';
      case 'student':
        return 'EngToeic Student';
      case 'staff':
        return 'EngToeic Staff';
      default:
        return 'EngToeic-Center';
    }
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <h1 className="logo">{getLogoName()}</h1>
      </div>
      <div className="header-right">
        <div className="notification-icon">
          <FaBell />
        </div>
        <div className="account-icon">
          <FaUserCircle />
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="main-nav">
        <ul>
          {links.map((link) => (
            <li
              key={link.key}
              onClick={() => setActiveTab(link.key)}
              className={activeTab === link.key ? 'active' : ''}
            >
              {link.icon && <link.icon className="nav-icon" />}
              <span>{link.name}</span>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;