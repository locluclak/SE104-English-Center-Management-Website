
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';
import { comparePathname } from '@/utils/uri';

export const routePath = [
  {
    icon: "fa-solid fa-list",
    title: "ĐẶT HÀNG",
    link: "/order",
    roles: ["ROLE_ADMIN", "ROLE_STAFF"],
    children: [
      {
        icon: "fa-solid fa-mug-saucer",
        title: "CHỌN BÀN",
        link: "choose-table",
        roles: ["ROLE_ADMIN", "ROLE_STAFF"]
      },
      {
        icon: "fa-solid fa-cart-plus",
        title: "GỌI MÓN",
        link: "place-order",
        roles: ["ROLE_ADMIN", "ROLE_STAFF"]
      },
      {
        icon: "fa-solid fa-clipboard-list",
        title: "ĐƠN HÀNG",
        link: "list",
        roles: ["ROLE_ADMIN", "ROLE_STAFF"]
      }
    ]
  },
  {
    icon: "fa-solid fa-list",
    title: "QUẢN LÝ DANH SÁCH",
    link: "/manage-list",
    // roles: ["ROLE_ADMIN"],
    roles: ["ROLE_ADMIN", "ROLE_STAFF"],
    children: [
      {
        icon: "fa-solid fa-martini-glass",
        title: "SẢN PHẨM",
        link: "product",
        roles: ["ROLE_ADMIN"]
      },
      {
        icon: "fa-solid fa-box",
        title: "NGUYÊN LIỆU",
        link: "material",
        roles: ["ROLE_ADMIN"]
      },
      {
        icon: "fa-solid fa-ticket",
        title: "VOUCHER & COUPON",
        link: "promote",
        roles: ["ROLE_ADMIN"]
      },
      {
        icon: "fa-solid fa-users",
        title: "KHÁCH HÀNG",
        link: "customer",
        roles: ["ROLE_ADMIN", "ROLE_STAFF"]
      },
      {
        icon: "fa-regular fa-rectangle-list",
        title: "NHÂN VIÊN",
        link: "staff",
        roles: ["ROLE_ADMIN"]
      },
    ]
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "THỐNG KÊ",
    link: "/statistics",
    roles: ["ROLE_ADMIN"]
  },
  {
    icon: "fa-solid fa-user",
    title: "THÔNG TIN NHÂN VIÊN",
    link: "/staff-info",
    roles: ["ROLE_ADMIN", "ROLE_STAFF"]
  }

];

type SubRoutesState = {
  [key: string]: boolean;
};

const Navbar: React.FC = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [openSubRoutes, setOpenSubRoutes] = useState<SubRoutesState>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setCurrentPath(location.pathname);
    const role = localStorage.getItem('role');
  }, [location]);

  const toggleSubRoutes = (path: string) => {
    setOpenSubRoutes((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }

  const renderNavigationList = () => {
    return routePath.map((route, index) => {
      if (!route.roles) return null;
      if (localStorage.getItem("role") && !route.roles.includes(localStorage.getItem("role") || "")) return null;

      const hasChildren = route.children && route.children.length > 0;
      const isActive = comparePathname(route.link ?? "", currentPath);
      const isOpen = openSubRoutes[route.link ?? ""];

      return (
        <li key={index} className={`nav-item ${hasChildren ? "dropdown" : ""}`}>
          <Link
            to={hasChildren ? "#" : route.link ?? "#"}
            className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            onClick={
              hasChildren
                ? (e) => {
                  e.preventDefault();
                  if (route.link) {
                    toggleSubRoutes(route.link);
                  }
                }
                : undefined
            }
          >
            <span className="icon">
              <i className={route.icon}></i>
            </span>
            <span className={`title ${isActive ? "title-active" : ""}`}>
              {route.title}
            </span>
            {hasChildren && (
              <span className={`arrow ${isOpen ? "up" : "down"}`}>
                <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
              </span>
            )}
          </Link>
          {hasChildren && isOpen && (
            <ul className="nav-children nav nav-pills">
              {route.children.map((subRoute, subIndex) => {
                if (!subRoute.roles) return null;
                if (localStorage.getItem("role") && !subRoute.roles.includes(localStorage.getItem("role") || "")) return null;
                return (
                  <li key={subIndex} className="nav-item">
                    <Link
                      to={`${route.link}/${subRoute.link}`}
                      className={`nav-link ${comparePathname(
                        `${route.link}/${subRoute.link}`,
                        currentPath
                      )
                          ? "nav-link-active"
                          : ""
                        }`}
                    >
                      <span className="icon">
                        <i className={subRoute.icon}></i>
                      </span>
                      <span className={`title ${comparePathname(
                        `${route.link}/${subRoute.link}`,
                        currentPath
                      )
                          ? "title-active"
                          : ""
                        }`}>
                        {subRoute.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <div className="d-flex flex-column align-items-start navbar">
        <h1 className="logo">
          <svg width="90" height="50" viewBox="0 0 100 61" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_4813)">
              <path d="M85.7065 5.92603H22.6784C15.2321 5.92603 9.17236 11.465 9.17236 18.2714V29.9214C9.17236 34.2546 10.8921 38.1928 13.6744 41.2215V79.9984C13.6744 81.0898 14.1487 82.1365 14.993 82.9082C15.8373 83.68 16.9824 84.1135 18.1764 84.1135H54.1924C55.3864 84.1135 56.5315 83.68 57.3758 82.9082C58.2201 82.1365 58.6944 81.0898 58.6944 79.9984V59.4227H76.7025V79.9984C76.7025 81.0898 77.1768 82.1365 78.0211 82.9082C78.8654 83.68 80.0105 84.1135 81.2045 84.1135H90.2085C91.4025 84.1135 92.5476 83.68 93.3919 82.9082C94.2362 82.1365 94.7105 81.0898 94.7105 79.9984V41.2174C97.4927 38.1928 99.2125 34.2546 99.2125 29.9172V18.2714C99.2125 11.465 93.1528 5.92603 85.7065 5.92603ZM90.2085 18.2714V29.9214C90.2085 34.6126 86.3863 38.6125 81.6952 38.8388L81.2045 38.8471C76.2388 38.8471 72.2005 35.1558 72.2005 30.6168V14.1563H85.7065C88.1916 14.1563 90.2085 16.004 90.2085 18.2714ZM45.1884 30.6168V14.1563H63.1964V30.6168C63.1964 35.1558 59.1581 38.8471 54.1924 38.8471C49.2267 38.8471 45.1884 35.1558 45.1884 30.6168ZM18.1764 18.2714C18.1764 16.004 20.1933 14.1563 22.6784 14.1563H36.1844V30.6168C36.1844 35.1558 32.1461 38.8471 27.1804 38.8471L26.6897 38.8347C21.9986 38.6125 18.1764 34.6126 18.1764 29.9214V18.2714ZM45.1884 63.5379H27.1804V51.1925H45.1884V63.5379Z" fill="url(#paint0_linear_1_4813)" />
              <path d="M85.7065 5.92603H22.6784C15.2321 5.92603 9.17236 11.465 9.17236 18.2714V29.9214C9.17236 34.2546 10.8921 38.1928 13.6744 41.2215V79.9984C13.6744 81.0898 14.1487 82.1365 14.993 82.9082C15.8373 83.68 16.9824 84.1135 18.1764 84.1135H54.1924C55.3864 84.1135 56.5315 83.68 57.3758 82.9082C58.2201 82.1365 58.6944 81.0898 58.6944 79.9984V59.4227H76.7025V79.9984C76.7025 81.0898 77.1768 82.1365 78.0211 82.9082C78.8654 83.68 80.0105 84.1135 81.2045 84.1135H90.2085C91.4025 84.1135 92.5476 83.68 93.3919 82.9082C94.2362 82.1365 94.7105 81.0898 94.7105 79.9984V41.2174C97.4927 38.1928 99.2125 34.2546 99.2125 29.9172V18.2714C99.2125 11.465 93.1528 5.92603 85.7065 5.92603ZM90.2085 18.2714V29.9214C90.2085 34.6126 86.3863 38.6125 81.6952 38.8388L81.2045 38.8471C76.2388 38.8471 72.2005 35.1558 72.2005 30.6168V14.1563H85.7065C88.1916 14.1563 90.2085 16.004 90.2085 18.2714ZM45.1884 30.6168V14.1563H63.1964V30.6168C63.1964 35.1558 59.1581 38.8471 54.1924 38.8471C49.2267 38.8471 45.1884 35.1558 45.1884 30.6168ZM18.1764 18.2714C18.1764 16.004 20.1933 14.1563 22.6784 14.1563H36.1844V30.6168C36.1844 35.1558 32.1461 38.8471 27.1804 38.8471L26.6897 38.8347C21.9986 38.6125 18.1764 34.6126 18.1764 29.9214V18.2714ZM45.1884 63.5379H27.1804V51.1925H45.1884V63.5379Z" fill="url(#paint0_linear_1_4813)" />
            </g>
            <defs>
              <linearGradient id="paint0_linear_1_4813" x1="54.1924" y1="5.92603" x2="54.1924" y2="84.1135" gradientUnits="userSpaceOnUse">
                <stop stop-color="#557C8D" />
                <stop offset="1" stop-color="#2F4156" />
              </linearGradient>
              <clipPath id="clip0_1_4813">
                <rect width="98.6741" height="60" fill="white" transform="translate(0.538574 0.82251)" />
              </clipPath>
            </defs>
          </svg>
        </h1>
        <ul className="nav nav-pills">{renderNavigationList()}</ul>
        {/* Log Out Button */}
        {/* <Link to="/log-out" className="logout-box">
        <i className="fa-solid fa-sign-out"></i>
        LOG OUT
      </Link> */}
        <button className="logout-box" onClick={handleLogout}>
          <i className="fa-solid fa-sign-out"></i>
          LOG OUT
        </button>
      </div>
    </>
  );
};

export default Navbar;
