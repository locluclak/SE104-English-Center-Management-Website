import { FaBell, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ role, links, activeTab, setActiveTab }) => {
  const getLogoName = () => {
    switch (role) {
      default:
        return 'EngToeic-Center';
    }
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1 className="logo">{getLogoName()}</h1>
        </div>

        <ul className="navbar-center">
          {links
            .filter((link) => link.key !== 'home')
            .map((link) => (
              <li
                key={link.key}
                onClick={() => setActiveTab(link.key)}
                className={activeTab === link.key ? 'active' : ''}
              >
                <span>{link.name}</span>
              </li>
            ))}
        </ul>

        <div className="navbar-right">
          <FaBell className="icon" />
          <FaUserCircle className="icon" />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
