import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdLandscape, MdWarning, MdNotificationsActive, MdReport, MdSecurity,MdMenu,MdClose } from "react-icons/md";
import { MdLandslide } from 'react-icons/md';
import LiveAlerts from "../components/LiveAlerts";
import { Toaster, toast } from 'react-hot-toast';
import axios from "axios";
import { useSelector } from "react-redux";
import { IoIosNotifications } from "react-icons/io";
import { io } from 'socket.io-client';
import { initSocket } from "../lib/socket";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FaExclamationTriangle, FaRunning, FaInfoCircle } from 'react-icons/fa';
import RiskMap from "../components/RiskMap";
import Reports from "../components/Reports";
import ChatRoom from "../components/ChatRoom";
import Analysis from "../components/Analysis";
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};

const socket = initSocket('https://landslidedisasterriskmanagmentbackend.onrender.com');

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [active, setActive] = useState('Dashboard');
  const baseUrl = useSelector((state) => state.base.baseUrl);
  const [user, setUser] = useState(null);
  const [privateAlert, setPrivateAlerts] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showAlertBox, setShowAlertBox] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reports, setReports] = useState(null);
  const[mobileNavOpen,setMobileNavOpen] = useState(false)
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/reports/getReports`, {
        withCredentials: true
      })
      if (res.data) {
        console.log("reports fetched successfully"),
          setReports(res.data?.reports);
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchReports()

  }, [])

  const noOfReports = Array.isArray(reports) && reports.length;

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const getMyAlerts = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/alerts/getMyAlert`, {
        withCredentials: true
      });
      if (res.data) {
        setPrivateAlerts(res.data);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getMyAlerts();
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);
  useEffect(() => {
    const socket = io(baseUrl, { withCredentials: true });

    socket.on("newAlert", (newAlert) => {
      console.log("New alert received:", newAlert);
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
      setUnreadCount((prevCount) => prevCount + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getAllAlerts = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/alerts/allAlertOngoing`, {
        withCredentials: true
      });
      if (res.data) {
        setAlerts(res.data.alert2 || []);
        setUnreadCount(res.data.alert2?.length || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };
  console.log(alerts);

  useEffect(() => {
    socket.on("newAlert", (newAlerts) => {
      console.log("New alerts received:", newAlerts);
      setAlerts(prev => Array.isArray(newAlerts) ? [...newAlerts, ...prev] : "");
      setUnreadCount(prev => prev + newAlerts.length);
    });

    return () => {
      socket.off("newAlert");
    };
  }, []);

  useEffect(() => {
    getAllAlerts();
  }, []);

  const handleBellClick = () => {
    if (alerts.length > 0) {
      setShowAlertBox(!showAlertBox);
      if (!showAlertBox && alerts.length > 0) {
        setSelectedAlert(alerts[0]);
      }
    }
  };
  const latestAlert = alerts.slice().reverse()[0];
  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setShowAlertBox(true);
  };

  const closeAlertBox = () => {
    setShowAlertBox(false);
    setUnreadCount(0);
  };



  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-base-200 to-base-300 text-base-content">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 mb-4"></div>
          <div className="h-4 w-32 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  const handleToggleOptions = () => {
    setShowOptions(prevState => !prevState);
  };

  const handleLogout = async () => {
    try {
      const res = await axios.delete(`${baseUrl}/api/auth/logout`, {
        withCredentials: true
      });
      if (res.data) {
        toast.success("User logout successfully");
        localStorage.clear("user");
        localStorage.clear("theme");
        localStorage.clear("token");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || error);
    }
  };
  console.log(alerts);

  return (
    <div className="flex min-h-screen overflow-auto bg-gradient-to-br from-base-100 to-base-200 text-base-content">
      <Toaster position="top-center" reverseOrder={false} />

      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-200/90 backdrop-blur-sm border border-base-300 shadow-sm"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        {mobileNavOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-base-200/95 backdrop-blur-sm p-6 border-r border-base-300 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                <MdLandslide size={24} />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                LandslideWatch
              </h2>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { name: "Dashboard", icon: "📊" },
                { name: "Live Alerts", icon: "🚨" },
                { name: "Risk Map", icon: "🗺️" },
                { name: "Reports", icon: "📄" },
                { name: "Rooms", icon: "💬" },
                { name: "Settings", icon: "⚙️" }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active === item.name ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-300/50'}`}
                  onClick={() => {
                    setActive(item.name);
                    setMobileNavOpen(false);
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-base-200/90 backdrop-blur-sm p-6 hidden md:block border-r border-base-300 shadow-sm"
      >
         <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                <MdLandslide size={24} />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                LandslideWatch
              </h2>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { name: "Dashboard", icon: "📊" },
                { name: "Live Alerts", icon: "🚨" },
                { name: "Risk Map", icon: "🗺️" },
                { name: "Reports", icon: "📄" },
                { name: "Rooms", icon: "💬" },
                { name: "Settings", icon: "⚙️" }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active === item.name ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-300/50'}`}
                  onClick={() => {
                    setActive(item.name);
                    setMobileNavOpen(false);
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </nav>
      </motion.aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto h-screen px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              Welcome back, {user} 👋
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={0.5}
              className="text-base-content/70"
            >
              {active === "Dashboard"
                ? "Here's what's happening in your area"
                : active === "Live Alerts"
                  ? "Real-time landslide alerts and warnings"
                  : ""}
              {
                active === "Risk Map" ? "Check the Hotspots of the landslides" : ""
              }
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <IoIosNotifications
                size={30}
                className="cursor-pointer"
                onClick={handleBellClick}
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </div>
              )}

              {showAlertBox && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-base-100 shadow-xl rounded-lg z-50 border border-base-300">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">Alerts</h3>
                      <button
                        onClick={closeAlertBox}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                    {alerts.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {alerts.map((alert, index) => (
                          <div
                            key={index}
                            className={`p-3 border-b border-base-300 cursor-pointer ${selectedAlert === alert ? 'bg-base-300' : 'hover:bg-base-300'}`}
                            onClick={() => handleAlertClick(alert)}
                          >
                            <h4 className="font-medium">{alert.locationName}</h4>
                            <p className="text-sm text-gray-600">{alert.severity === "low" ? 'Low Risk Take mile precautions' : alert.severity === "Medium" ? " Medium alert go far from the place to avoid risk" : "Severe Risk evacuate area now"}</p>
                            <p className="flex items-center gap-2">
                              lat:{alert.coordinates.lat} lng:{alert.coordinates.lng}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 py-2">No alerts to display</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="avatar online relative cursor-pointer"
              onClick={handleToggleOptions}
            >
              <div className="w-12 h-12 relative rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-lg font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {user.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </span>
              </div>
              {showOptions && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-base-200 p-1.5 rounded-lg border border-base-100 shadow-xl backdrop-blur-sm z-30 w-56 overflow-hidden transition-all duration-200 origin-top animate-scaleIn">
                  <div className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Account</div>
                  <button
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/90 active:bg-gray-100 transition-colors duration-150 rounded-[6px] group"
                    onClick={() => alert('Update Profile')}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Update Profile
                    <span className="ml-auto text-xs text-gray-400 group-hover:text-blue-500">⌘P</span>
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/90 active:bg-gray-100 transition-colors duration-150 rounded-[6px] group"
                    onClick={() => alert('Settings')}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                    <span className="ml-auto text-xs text-gray-400 group-hover:text-blue-500">⌘S</span>
                  </button>
                  <div className="border-t border-gray-100/60 mx-2 my-1"></div>
                  <button
                    className="flex items-center w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/90 active:bg-rose-100/80 transition-colors duration-150 rounded-[6px] group"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4 mr-3 text-rose-400 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Logout
                    <span className="ml-auto text-xs text-rose-400 group-hover:text-rose-600">⌘Q</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {active === "Live Alerts" ? (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LiveAlerts />
            </motion.div>
          ) : ""}
          {active === "Dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative rounded-2xl mb-4 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-800 py-3">

                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-blue-900 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-blue-800 to-transparent z-10" />

                <div className="whitespace-nowrap">
                  <div className="animate-marquee-ltr inline-block">
                    {reports?.map((item, index) => (
                      <div key={`main-${index}`} className="inline-flex items-center mx-10">
                        <FaExclamationTriangle className="text-yellow-300 text-xl mr-3 animate-pulse" />
                        <span className="font-bold text-white text-lg">
                          LANDSLIDE WARNING: {item.locationName.toUpperCase()}
                        </span>
                        <FaInfoCircle className="text-blue-200 mx-3" />
                        <span className="text-yellow-100">
                          Risk Level: {item.riskLevel} • Evacuate if advised •
                        </span>
                        <FaRunning className="text-red-300 ml-3" />
                      </div>
                    ))}
                  </div>

                  <div className="animate-marquee-ltr inline-block" aria-hidden="true">
                    {reports?.map((item, index) => (
                      <div key={`mirror-${index}`} className="inline-flex items-center mx-10">
                        <FaExclamationTriangle className="text-yellow-300 text-xl mr-3 animate-pulse" />
                        <span className="font-bold text-white text-lg">
                          LANDSLIDE WARNING: {item.locationName.toUpperCase()}
                        </span>
                        <FaInfoCircle className="text-blue-200 mx-3" />
                        <span className="text-yellow-100">
                          Risk Level: {item.riskLevel} • Evacuate if advised •
                        </span>
                        <FaRunning className="text-red-300 ml-3" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">

                {[
                  {
                    title: "Current Risk Level",
                    value: alerts[0]?.severity,
                    description: `Updated ${new Date(alerts[0]?.updatedAt).getMinutes()} mins ago`,
                    icon: <MdWarning className="text-2xl" />,
                    color: "warning",
                    bg: "bg-gradient-to-br from-warning/90 to-warning/70",
                  },
                  {
                    title: "Recent Reports",
                    value: `${noOfReports} Reports`,
                    description: "24hr reported landslides",
                    icon: <MdReport className="text-2xl" />,
                    color: "info",
                    bg: "bg-gradient-to-br from-info/90 to-info/70",
                  },
                  {
                    title: "Live Alerts",
                    value: `${alerts.length} Ongoing`,
                    description: (() => {
                      const latestAlert = alerts.at(-1);
                      if (!latestAlert) return "✅ No active alerts at the moment. Stay safe!";

                      const { locationName, severity } = latestAlert;
                      const severityMessage = {
                        low: "🟡 Minor risk detected. Stay alert and follow safety guidelines.",
                        medium: "🟠 Moderate risk in the area. Be ready to evacuate if needed!",
                        high: "🔴 Severe threat! Evacuate the area immediately! 🚨",
                        severe: "🚨 EXTREME DANGER! Immediate evacuation required! 🚨",
                      }[severity?.toLowerCase()] || "⚠️ Risk level unknown. Stay cautious.";

                      return `${locationName} — ${severityMessage}`;
                    })(),
                    icon: <MdNotificationsActive className="text-2xl" />,
                    color: "error",
                    bg: "bg-gradient-to-br from-error/90 to-error/70",
                  }


                ].map((card, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`p-5 cursor-pointer rounded-xl shadow-lg ${card.bg} text-${card.color}-content overflow-hidden relative`}
                  >
                    <div className="absolute -right-5 -bottom-5 opacity-20">
                      {React.cloneElement(card.icon, { size: 80 })}
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg animate bg-white/10 backdrop-blur-sm">
                          {card.icon}
                        </div>
                        <h3 className="text-lg font-semibold">{card.title}</h3>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold my-2">{card.value}</p>
                      <p className="text-sm opacity-90">{card.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="">
                <Analysis />
              </div>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  custom={3}
                  className="p-5 rounded-xl bg-gradient-to-br from-base-200/90 to-base-300/80 backdrop-blur-sm shadow-lg border border-base-300/50 overflow-hidden relative group"
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm"
                      >
                        <MdLandscape size={20} />
                      </motion.div>
                      <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Risk Map Preview
                      </h2>
                    </div>

                    <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border border-base-300/30 shadow-inner">
                      <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-300">
                        <iframe
                          className="w-full h-full"
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.044099862992!2d85.32165581506202!3d27.71724598279361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1908f43f163d%3A0x36fcdfbbd31bd20c!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1681565745703!5m2!1sen!2snp"
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>

                      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse cursor-pointer hover:scale-150 transition-transform duration-200">
                        <div className="absolute -left-2 -top-8 bg-error text-error-content px-2 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                          High Risk Zone
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-500 rounded-full shadow-lg animate-pulse cursor-pointer hover:scale-150 transition-transform duration-200">
                        <div className="absolute -left-2 -top-8 bg-warning text-warning-content px-2 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                          Moderate Risk
                        </div>
                      </div>

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                        className="relative z-10 text-center p-4"
                      >
                        <p className="text-base-content/80 mb-2 font-medium">Interactive Map Coming Soon</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <span>View Full Map</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-success">Low Risk</span>
                        <span className="text-warning">Moderate Risk</span>
                        <span className="text-error">High Risk</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gradient-to-r from-success via-warning to-error h-2 rounded-full overflow-hidden">
                          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                        </div>
                        <motion.div
                          animate={{
                            x: ["0%", "50%", "100%", "50%", "0%"]
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute top-0 w-2 h-2 bg-white rounded-full shadow-lg"
                          style={{ left: '0%' }}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-base-100/50 p-3 rounded-lg border border-base-300/30 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-base-content/80">Risk Zones</h3>
                            <div className="p-1 rounded bg-primary/10 text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center"><span className="w-2 h-2 bg-success rounded-full mr-2"></span> Low</span>
                              <span>24 zones</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center"><span className="w-2 h-2 bg-warning rounded-full mr-2"></span> Moderate</span>
                              <span>12 zones</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center"><span className="w-2 h-2 bg-error rounded-full mr-2"></span> High</span>
                              <span>5 zones</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-base-100/50 p-3 rounded-lg border border-base-300/30 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-base-content/80">Recent Alerts</h3>
                            <div className="p-1 rounded bg-secondary/10 text-secondary">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-start text-xs">
                              <span className="w-2 h-2 bg-error rounded-full mt-1 mr-2 animate-pulse"></span>
                              <span>Flood warning in Zone 12B</span>
                            </div>
                            <div className="flex items-start text-xs">
                              <span className="w-2 h-2 bg-warning rounded-full mt-1 mr-2"></span>
                              <span>Landslide risk in Zone 7C</span>
                            </div>
                            <div className="flex items-start text-xs">
                              <span className="w-2 h-2 bg-success rounded-full mt-1 mr-2"></span>
                              <span>Zone 3A status normalized</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-base-100/50 p-3 rounded-lg border border-base-300/30 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-base-content/80">Recommended Actions</h3>
                            <div className="p-1 rounded bg-accent/10 text-accent">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <button className="w-full text-left text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                              Download Risk Report
                            </button>
                            <button className="w-full text-left text-xs px-2 py-1 bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors">
                              Share Map View
                            </button>
                            <button className="w-full text-left text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors">
                              Request Area Assessment
                            </button>
                          </div>
                        </div>
                      </div>


                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                    }
                  }}
                  className="p-6 rounded-xl bg-gradient-to-br from-base-200 to-base-300/80 backdrop-blur-sm shadow-lg border border-base-300/50 relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-primary/10 blur-xl"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 rounded-full bg-secondary/10 blur-xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm"
                      >
                        <MdSecurity size={24} />
                      </motion.div>
                      <motion.h2
                        className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                        whileHover={{ x: 5 }}
                      >
                        Safety Guidelines
                      </motion.h2>
                    </div>

                    <ul className="space-y-4">
                      {[
                        {
                          text: "Stay away from steep slopes during rainfall",
                          icon: "🌧️",
                          color: "from-blue-400/20 to-blue-600/20"
                        },
                        {
                          text: "Evacuate immediately if you hear unusual sounds",
                          icon: "👂",
                          color: "from-purple-400/20 to-purple-600/20"
                        },
                        {
                          text: "Follow local alerts and emergency channels",
                          icon: "📢",
                          color: "from-amber-400/20 to-amber-600/20"
                        },
                        {
                          text: "Have an emergency kit ready during monsoon season",
                          icon: "🛠️",
                          color: "from-emerald-400/20 to-emerald-600/20"
                        }
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          custom={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                              delay: i * 0.1,
                              type: "spring",
                              stiffness: 300,
                              damping: 15
                            }
                          }}
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                          }}
                          className={`p-4 rounded-lg bg-gradient-to-r ${item.color} backdrop-blur-sm border border-base-300/30 flex items-start gap-4 cursor-pointer transition-all duration-200`}
                        >
                          <motion.div
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg shadow-inner"
                            whileTap={{ scale: 0.9 }}
                          >
                            {item.icon}
                          </motion.div>
                          <div>
                            <p className="font-medium text-base-content">{item.text}</p>
                            <motion.button
                              whileHover={{ x: 3 }}
                              className="mt-2 text-xs text-primary flex items-center gap-1"
                            >
                              Learn more
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Footer with emergency contact */}
                    <motion.div
                      className="mt-6 pt-4 border-t border-base-300/30 flex justify-between items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.5 } }}
                    >
                      <div className="text-sm text-base-content/70">
                        Need immediate help?
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-error/10 text-error rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Emergency Contact
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : ""}
          {active === "Risk Map" ? (
            <RiskMap />
          ) : ""}
          {active === "Reports" ? <Reports /> : ''}
          {
            active === "Rooms" ? <ChatRoom />
              : ""}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Dashboard;
