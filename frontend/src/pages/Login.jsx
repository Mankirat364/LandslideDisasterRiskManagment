import React, { useState, useEffect } from 'react';
import { CiLight } from "react-icons/ci";
import { MdDarkMode, MdLandslide, MdVisibility, MdVisibilityOff } from "react-icons/md";
import landslide from '../assets/landslide.jpg';
import { useDispatch, useSelector } from "react-redux"
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import UpdateModal from '../components/UpdateModal';

const Login = () => {
  const dispatch = useDispatch();
  const baseUrl = useSelector((state) => state.base.baseUrl);
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);





  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      const isValid = /^\S+@\S+\.\S+$/.test(value);
      setEmailError(!isValid && value.length > 0);
    }

    if (name === 'password') {
      const isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value);
      setPasswordError(!isValid && value.length > 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validEmail = /^\S+@\S+\.\S+$/.test(formData.email);
    const validPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password);

    setEmailError(!validEmail);
    setPasswordError(!validPassword);

    if (validEmail && validPassword) {
      console.log("Form Submitted ✅", formData);
      try {
        const res = await axios.post(`${baseUrl}/api/auth/sign-in`, formData, {
          withCredentials: true
        })
        if (res.data) {
          toast.success("User Login Successfully");
          setUserData(res.data);
          window.location.reload()
          setTimeout(() => {
            navigate('/')
          }, 3000)
        }
      } catch (error) {
        console.error("Error: ", error);
        if (error.response && error.response.data) {
          const errorMsg = typeof error.response.data.message === 'string'
            ? error.response.data.message
            : JSON.stringify(error.response.data.message);

          toast.error(errorMsg);
        } else {
          toast.error("An unexpected error occurred");
        }

      }
    }
  };
  useEffect(() => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData.user?.fullName));
      localStorage.setItem("userid", JSON.stringify(userData.user?._id));
      localStorage.setItem('role', JSON.stringify(userData.user?.role));
    } 
  }, [userData]);


  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-between bg-base-100 transition-colors duration-300 p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full lg:w-[55%] space-y-6 p-4 lg:p-10">
        <div className="flex items-center space-x-4 mb-4">
          <MdLandslide size={40} className="text-primary" />
          <h1 className="text-4xl lg:text-5xl font-bold">Login into your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">


          <div>
            <label className="label text-xl">What is your email?</label>
            <input
              type="email"
              name="email"
              className={`input input-bordered input-lg w-full ${emailError ? 'input-error' : ''}`}
              placeholder="mail@site.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && (
              <p className="text-error text-sm mt-1">Please enter a valid email address.</p>
            )}
          </div>

          <div>
            <label className="label text-xl">What is your password?</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                className={`input input-bordered input-lg w-full ${passwordError ? 'input-error' : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-3 cursor-pointer"
              >
                {passwordVisible ? <MdVisibilityOff size={24} /> : <MdVisibility size={24} />}
              </span>
            </div>
            {passwordError && (
              <div className="text-error text-sm mt-1 space-y-1">
                <p>Password must be at least 8 characters long and include:</p>
                <ul className="list-disc list-inside text-xs">
                  <li>At least one number</li>
                  <li>One lowercase letter</li>
                  <li>One uppercase letter</li>
                </ul>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full mt-4">
            Login
          </button>
          <div className="flex justify-between items-center ">
            <p className="text-lg text-gray-500">
              Not have an account?{" "}
              <Link
                to="/sign-up"
                className="text-blue-500 font-semibold hover:text-blue-700 transition-all duration-300 hover:underline hover:tracking-wide"
              >
                Signup →
              </Link>
            </p>
            <div className="text-right ">
              <p className="text-lg text-gray-500 hover:text-red-500 transition-all duration-300 group cursor-pointer">
                <label htmlFor="reset-modal">
                  <span className="relative inline-block">
                    Forgot Password?
                    <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </label>
              </p>
            </div>

          </div>

        </form>
      </div>

      <div className="hidden lg:block w-full lg:w-[45%] rounded-2xl overflow-hidden relative group h-[96vh] shadow-lg hover:scale-105 transition-transform duration-500 cursor-pointer">
        <img
          src={landslide}
          alt="Landslide disaster"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent mix-blend-overlay animate-pulse-slow"></div>
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-2xl transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center space-y-4">
          <h2 className="text-white text-7xl font-bold leading-tight group-hover:translate-y-0 translate-y-10 line-height-normal transition-transform duration-700">
            Landslide Disaster Management
          </h2>
          <p className="text-white/80 text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            Advanced systems for prediction, prevention, and response to landslide emergencies
          </p>
          <button className="btn btn-sm btn-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
            Learn More
          </button>
        </div>
        <div className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded-full text-3xl font-bold flex items-center animate-pulse">
          <span className="w-5 h-5 bg-white  rounded-full mr-2"></span>
          DISASTER ALERT
        </div>
      </div>
      <UpdateModal />
    </div>
  );
};

export default Login;
