import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const Analysis = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const baseUrl = useSelector((state) => state.base.baseUrl);
    const chartRef = useRef(null);
    const riskChartRef = useRef(null);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/reports/getReports`, {
                withCredentials: true
            });
            if (res.data) {
                console.log("Reports fetched successfully");
                setReports(res.data?.reports);
                if (res.data?.reports?.length > 0) {
                    setSelectedReport(res.data.reports[0]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (selectedReport && selectedReport.rainfallForecast24h) {
            renderRainfallChart();
            renderRiskChart();
        }
        return () => {
            if (chartRef.current) chartRef.current.destroy();
            if (riskChartRef.current) riskChartRef.current.destroy();
        };
    }, [selectedReport]);

    const renderRainfallChart = () => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = document.getElementById('rainfallChart');
        if (!ctx) return;

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 8 }, (_, i) => `${i * 3}h`),
                datasets: [{
                    label: 'Rainfall Forecast (mm)',
                    data: selectedReport.rainfallForecast24h,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Rainfall (mm)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });
    };

    const renderRiskChart = () => {
        if (riskChartRef.current) {
            riskChartRef.current.destroy();
        }

        const ctx = document.getElementById('riskChart');
        if (!ctx) return;

        const riskCounts = {
            high: reports.filter(r => r.riskLevel?.toLowerCase() === 'high').length,
            medium: reports.filter(r => r.riskLevel?.toLowerCase() === 'medium').length,
            low: reports.filter(r => r.riskLevel?.toLowerCase() === 'low').length
        };

        riskChartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [riskCounts.high, riskCounts.medium, riskCounts.low],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(234, 179, 8, 0.7)',
                        'rgba(34, 197, 94, 0.7)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(234, 179, 8, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Risk Level Distribution'
                    }
                },
                cutout: '70%'
            }
        });
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getRainTrendColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'increasing': return 'text-red-500';
            case 'decreasing': return 'text-green-500';
            case 'stable': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Landslide Risk Dashboard</h1>
                        <p className="text-sm text-gray-500">Real-time monitoring and analysis</p>
                    </div>
                    <div className="badge badge-primary gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                        Live Data
                    </div>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            <div className="flex items-center">
                                <div className="stat p-0">
                                    <div className="stat-title text-sm">Total Locations</div>
                                    <div className="stat-value text-primary text-xl md:text-2xl">{reports.length}</div>
                                    <div className="stat-desc text-xs">Monitored areas</div>
                                </div>
                                <div className="ml-auto text-primary opacity-30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            <div className="flex items-center">
                                <div className="stat p-0">
                                    <div className="stat-title text-sm">High Risk</div>
                                    <div className="stat-value text-red-500 text-xl md:text-2xl">
                                        {reports.filter(r => r.riskLevel?.toLowerCase() === 'high').length}
                                    </div>
                                    <div className="stat-desc text-xs">Immediate attention</div>
                                </div>
                                <div className="ml-auto text-red-500 opacity-30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            <div className="flex items-center">
                                <div className="stat p-0">
                                    <div className="stat-title text-sm">Avg Rainfall</div>
                                    <div className="stat-value text-blue-500 text-xl md:text-2xl">
                                        {(reports.reduce((sum, r) => sum + (r.rainfall || 0), 0) / (reports.length || 1)).toFixed(2)} mm
                                    </div>
                                    <div className="stat-desc text-xs">Across locations</div>
                                </div>
                                <div className="ml-auto text-blue-500 opacity-30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            <div className="flex items-center">
                                <div className="stat p-0">
                                    <div className="stat-title text-sm">Last Updated</div>
                                    <div className="stat-value text-secondary text-xl md:text-2xl">
                                        {reports.length > 0 ? formatDate(reports[0].lastUpdated).split(',')[0] : 'N/A'}
                                    </div>
                                    <div className="stat-desc text-xs">Most recent data</div>
                                </div>
                                <div className="ml-auto text-secondary opacity-30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1   lg:grid-cols-3 gap-4">
                    <div className="h-[50vh]">
                        <div className="card bg-base-100 shadow-sm h-full">
                            <div className="card-body">
                                <h2 className="card-title text-lg font-semibold">Risk Distribution</h2>
                                <div className="h-64 w-full">
                                    <canvas id="riskChart"></canvas>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card bg-base-100 mt-3 z-50 mainanalys   shadow-sm  min-h-[45vh]">
                            <div className="card-body     ">
                                <h2 className="card-title text-lg font-semibold mb-3">Recent Reports</h2>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {reports.map((report) => (
                                        <div 
                                            key={report._id} 
                                            className={`p-3 rounded-lg cursor-pointer transition-all ${selectedReport?._id === report._id ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'}`}
                                            onClick={() => setSelectedReport(report)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="truncate">
                                                    <h3 className="font-bold truncate">{report.locationName}</h3>
                                                    <p className="text-xs opacity-80 truncate">{report.coordinates?.lat}, {report.coordinates?.lng}</p>
                                                </div>
                                                <div className={`badge ${getRiskColor(report.riskLevel)} text-white ml-2`}>
                                                    {report.riskLevel || 'Unknown'}
                                                </div>
                                            </div>
                                            <div className="mt-1 flex justify-between items-center text-xs">
                                                <span>Rainfall: {report.rainfall} mm</span>
                                                <span className={`${getRainTrendColor(report.rainfallStatus)}`}>
                                                    {report.rainfallStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-2 selected">
                        {selectedReport ? (
                            <div className="card bg-base-100 shadow-sm h-full">
                                <div className="card-body">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                        <div>
                                            <h2 className="card-title text-xl md:text-2xl">{selectedReport.locationName}</h2>
                                            <p className="text-sm text-gray-500">{selectedReport.coordinates?.lat}, {selectedReport.coordinates?.lng}</p>
                                        </div>
                                        <div className={`badge ${getRiskColor(selectedReport.riskLevel)} text-white text-lg px-3 py-2 md:px-4 md:py-3`}>
                                            {selectedReport.riskLevel || 'Unknown'} Risk
                                        </div>
                                    </div>
                                    
                                    <div className="divider my-2 md:my-4"></div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-lg">Location Details</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Coordinates</p>
                                                        <p className="text-sm">{selectedReport.coordinates?.lat}, {selectedReport.coordinates?.lng}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Altitude</p>
                                                        <p className="text-sm">{selectedReport.altitude} meters</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Terrain</p>
                                                        <p className="text-sm">{selectedReport.terrainType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Soil Type</p>
                                                        <p className="text-sm">{selectedReport.soilType}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-lg">Weather Data</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Current Rainfall</p>
                                                        <p className="text-sm">{selectedReport.rainfall} mm</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Trend</p>
                                                        <p className={`text-sm ${getRainTrendColor(selectedReport.rainfallStatus)}`}>
                                                            {selectedReport.rainfallStatus}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium">Last Updated</p>
                                                        <p className="text-sm">{formatDate(selectedReport.lastUpdated)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <h3 className="font-semibold text-lg mb-2">24h Rainfall Forecast</h3>
                                                <div className="h-48 w-full">
                                                    <canvas id="rainfallChart"></canvas>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="divider my-2 md:my-4"></div>
                                    
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg">Advisory</h3>
                                        <div className={`alert ${selectedReport.riskLevel?.toLowerCase() === 'high' ? 'alert-error' : selectedReport.riskLevel?.toLowerCase() === 'medium' ? 'alert-warning' : 'alert-success'} shadow-lg`}>
                                            <div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <span>{selectedReport.advisoryMessage || "No specific advisory available"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Report created by: {selectedReport.user?.fullName} ({selectedReport.user?.email})</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Created at: {formatDate(selectedReport.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card bg-base-100 shadow-sm h-full">
                                <div className="card-body flex flex-col items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-700">No report selected</h3>
                                    <p className="mt-1 text-sm text-gray-500">Select a location from the list</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;