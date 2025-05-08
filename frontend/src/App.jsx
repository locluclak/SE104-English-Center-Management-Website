import React, { useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    if (currentPage === "login") {
      return <Login goBack={() => setCurrentPage("home")} />;
    } else if (currentPage === "signup") {
      return <SignUp goBack={() => setCurrentPage("home")} />;
    } else {
      return (
        <div className="home-container">
          <h1>Welcome to English Center</h1>
          <p className="home-subtitle">Đăng nhập hoặc đăng ký</p>
          <div className="button-group">
            <button onClick={() => setCurrentPage("login")} className="home-button">
              Login
            </button>
            <button onClick={() => setCurrentPage("signup")} className="home-button">
              Sign Up
            </button>
          </div>
        </div>
      );
    }
  };

  return <div>{renderPage()}</div>;
}

export default App;