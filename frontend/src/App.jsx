import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Home from './pages/Home';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { FaSun, FaMoon } from "react-icons/fa";
import { initSocket } from './lib/socket';

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const dispatch = useDispatch();
  const baseUrl = useSelector((state) => state.base.baseUrl);

  const checkTokenExist = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/auth/checkToken`, {
        withCredentials: true
      });

      console.log("Token check response:", res.data);

      if (res.data?.success) {
        setToken(true);
      } else {
        setToken(false);
      }
    } catch (error) {
      console.error(error?.response?.data?.message || 'Token check failed');
      setToken(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTokenExist();
  }, []);

  useEffect(() => {
    if (token !== null) {
      localStorage.setItem('token', JSON.stringify(token));
    }
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const isTokenValid = token;

  const AuthRedirect = ({ children }) => {
    return isTokenValid ? <Navigate to="/" replace /> : children;
  };
  useEffect(() => {
    initSocket(baseUrl);
  }, [baseUrl]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative min-h-screen">
      <button
        className="absolute border z-50 border-zinc-400 top-4 right-4 btn btn-circle btn-sm text-xl"
        onClick={toggleTheme}
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      <Router>
        <Routes>
          <Route
            path="/"
            element={isTokenValid ? <Home /> : <Navigate to="/sign-up" replace />}
          />

          <Route
            path="/sign-up"
            element={
              <AuthRedirect>
                <SignUp />
              </AuthRedirect>
            }
          />

          <Route
            path="/sign-in"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
