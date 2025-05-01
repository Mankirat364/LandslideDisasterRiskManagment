import axios from 'axios';
import React, { useEffect } from 'react';
import {
  FiMapPin,
  FiDroplet,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiLayers,
  FiNavigation,
  FiMinus,
  FiBarChart2,
  FiGlobe
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
const RiskBadge = ({ level }) => {
  const levelConfig = {
    high: {
      bg: 'bg-error',
      text: 'text-error-content',
      label: 'High Risk',
      icon: <FiAlertTriangle />
    },
    medium: {
      bg: 'bg-warning',
      text: 'text-warning-content',
      label: 'Medium Risk',
      icon: <FiAlertTriangle />
    },
    low: {
      bg: 'bg-success',
      text: 'text-success-content',
      label: 'Low Risk',
      icon: <FiInfo />
    }
  };

  const config = levelConfig[level.toLowerCase()] || levelConfig.low;

  return (
    <div className={`badge gap-1 ${config.bg} ${config.text} border-none`}>
      {config.icon}
      {config.label}
    </div>
  );
};
const getUserId = JSON.parse(localStorage.getItem("userid"))
const ReportCard = ({ report }) => {
  
const baseUrl = useSelector((state) => state.base.baseUrl);
  const TrendIcon = () => {
    if (report.rainfallStatus === 'increasing') {
      return <FiTrendingUp className="text-error" />;
    } else if (report.rainfallStatus === 'decreasing') {
      return <FiTrendingDown className="text-success" />;
    }
    return <FiMinus className="text-info" />;
  };
  const DeleteReport = async(ReportId) =>{
      try {
        const res = await axios.delete(`${baseUrl}/api/reports/deleteReport/${ReportId}`,{
          withCredentials : true
        })
        if(res.data){
          toast.success(res.data.message || "Report Deleted Successfully")
        }
      } catch (error) {
        toast.error(res.data.message || "Something went wrong")
      }
  } 
  return (
    <div className="card bg-base-100 shadow-xl min-w-[34vw]  hover:shadow-2xl transition-shadow">
        <Toaster position="top-center" reverseOrder={false} />
      <div className="card-body p-4 md:p-6">
        <div className="flex justify-between min-w-[24vw] items-start ">
          <div className="flex items-center gap-2 min-w-fit">
            <FiMapPin className="text-primary text-xl" />
            <h2 className="card-title text-base-content">{report.locationName}</h2>
          </div>
          <RiskBadge level={report.riskLevel} />
        </div>
        <div className="bg-base-200 p-4 rounded-box shadow-md border border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-neutral relative text-neutral-content rounded-full w-10">
                {report?.user?.fullName ? (
                  <span className="text-sm font-bold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {report.user.fullName
                      .split(' ')
                      .map(name => name[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold relative text-base-content">
                Reported By:{" "}
                <span className="text-primary  font-semibold">
                  {report?.user?.fullName || "Unknown"}
                </span>
              </h4>
              <p className="text-sm text-base-content/70">
                {report?.user?.email || "No email provided"}
              </p>
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <span className="badge badge-primary badge-sm">Verified</span>
            <span className="badge badge-outline badge-sm">Active</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="stats bg-primary/10 border border-primary/20">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FiDroplet className="text-2xl" />
              </div>
              <div className="stat-title text-base-content">Rainfall</div>
              <div className="stat-value text-primary">{report.rainfall}mm</div>
              <div className="stat-desc flex items-center gap-1">
                <TrendIcon />
                <span className="capitalize">{report.rainfallStatus}</span>
              </div>
            </div>
          </div>

          <div className="stats bg-secondary/10 border border-secondary/20">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <FiLayers className="text-2xl" />
              </div>
              <div className="stat-title text-base-content">Terrain</div>
              <div className="stat-value text-secondary">{report.terrainType}</div>
              <div className="stat-desc">{report.soilType} soil</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          <div className="stats bg-accent/10 border border-accent/20">
            <div className="stat">
              <div className="stat-figure text-accent">
                <FiNavigation className="text-2xl" />
              </div>
              <div className="stat-title text-base-content">Altitude</div>
              <div className="stat-value text-accent">{report.altitude}m</div>
            </div>
          </div>

          <div className="stats bg-info/10 border border-info/20">
            <div className="stat">
              <div className="stat-figure text-info">
                <FiGlobe className="text-2xl" />
              </div>
              <div className="stat-title text-base-content">Coordinates</div>
              <div className="stat-value text-info text-sm font-mono">
                {report.coordinates.lat}, {report.coordinates.lng}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base-content mb-2">
            <FiBarChart2 className="text-primary" />
            <span>24h Rainfall Forecast (mm)</span>
          </h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-2 min-w-max">
              {[0, 3, 6, 9, 12, 15, 18, 21].map((hour, idx) => (
                <div key={hour} className="bg-base-200 p-2 rounded-lg text-center">
                  <div className="text-xs text-base-content/70">{hour}h</div>
                  <div className="font-bold text-base-content">{report.rainfallForecast24h[idx]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {report.advisoryMessage && (

          <div className="alert alert-warning">
            <FiAlertTriangle />
            <div>
              <h3 className="font-bold">Advisory</h3>
              <div className="text-xs">{report.riskLevel === "high" ? '⚠️ High landslide risk. Avoid travel to the area. Monitor weather updates closely. ' : report.riskLevel === "low" ? 'Low landslide risk. Normal conditions.' : ""}
                {report.riskLevel === "medium" ? "Moderate landslide risk. Stay alert for weather warnings." : " Severe lanslide risk. Stay alert clear the area"}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center text-sm text-base-content/60">
          <FiClock className="mr-2" />
          Updated: {new Date(report.lastUpdated).toLocaleString()}
        </div>
        <div className="mt-4 p-4 bg-base-100 rounded-box border border-base-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-base-content/80">
              Issue is resolved?
              <span className="font-semibold ml-1">
                {report.user?._id === getUserId ? (
                  <span className="text-success">You can manage this report</span>
                ) : (
                  <span className="text-warning">Read-only access</span>
                )}
              </span>
            </p>

            {report.user?._id === getUserId ? (
              <button onClick={() => DeleteReport(report._id)} className="btn btn-error btn-sm text-error-content hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Report
              </button>
            ) : (
              <div className="badge badge-ghost badge-sm opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Can't delete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsDashboard = () => {
  const [reports, setReports] = useState(null);
  const baseUrl = useSelector((state) => state.base.baseUrl);
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
  console.log(reports);
  return (
    <div className="min-h-screen  bg-base-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <FiMapPin className="text-primary" />
            <span>Landslide Risk Reports</span>
          </h1>
          <p className="text-base-content/70 mt-2">Real-time monitoring of LandslideWatch</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {Array.isArray(reports) && reports.map(report => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;