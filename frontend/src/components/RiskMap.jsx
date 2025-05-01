import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
const WEATHER_API_KEY = "4a1e52e2c52049b6a60160342252504";
const NASA_FIRMS_KEY = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6Im1hbmtpcmF0c2luZ2giLCJleHAiOjE3NTA3ODMyOTQsImlhdCI6MTc0NTU5OTI5NCwiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.sVS_Pg0uFm2kPtZW5tNXu0dwVcQql3vfGLaZE9XqbySCSJyhG8iFdEzSWw3h_yCzXthSes7t1CpQaADe5iyLzqCvOQdkLM2uw7SKrvAGVpY-Q7NpLhwt8u5p73p4EtXP3DYN9jh9X53-B4MgybjVzIdq4Xx4yyFhf6sYvixIk2NAx5glH-MwoBGNtsoeretvAqIHjEXnYC1fsG7_x0n0vQW-Ynqh7JeTmjqh1MS7oLIe2WeGhjWZFJzQx_yA5RnLj7vDqD91jLxtIts1wUwxGyLH9gPDZjUcFormTvi136iyxclTxAjuZ7oHD8LL-5TKQdVgkvdvtXlXlzHqWLLujA";
const stations = [
  { _id: '1', name: 'Munnar', position: [10.0889, 77.0595], altitude: 1600, terrain: 'Western Ghats', soilType: 'Laterite' },
  { _id: '2', name: 'Ooty', position: [11.4091, 76.6938], altitude: 2240, terrain: 'Western Ghats', soilType: 'Red Soil' },
  { _id: '3', name: 'Wayanad', position: [11.6854, 76.1310], altitude: 800, terrain: 'Western Ghats', soilType: 'Laterite' },
  { _id: '4', name: 'Coorg', position: [12.3292, 75.7162], altitude: 1525, terrain: 'Western Ghats', soilType: 'Laterite' },
  { _id: '5', name: 'Mahabaleshwar', position: [17.9197, 73.6648], altitude: 1439, terrain: 'Western Ghats', soilType: 'Black Soil' },
  { _id: '6', name: 'Kodaikanal', position: [10.2381, 77.4892], altitude: 2133, terrain: 'Western Ghats', soilType: 'Red Soil' },
  { _id: '7', name: 'Nilgiris (Coonoor)', position: [11.3500, 76.8000], altitude: 1800, terrain: 'Western Ghats', soilType: 'Red Loam' },

  { _id: '8', name: 'Shimla', position: [31.1048, 77.1734], altitude: 2276, terrain: 'Himalayas', soilType: 'Loamy' },
  { _id: '9', name: 'Nainital', position: [29.3800, 79.4455], altitude: 2084, terrain: 'Himalayas', soilType: 'Silty Clay' },
  { _id: '10', name: 'Gangtok', position: [27.3389, 88.6065], altitude: 1650, terrain: 'Eastern Himalayas', soilType: 'Sandy Loam' },
  { _id: '11', name: 'Darjeeling', position: [27.0360, 88.2627], altitude: 2050, terrain: 'Eastern Himalayas', soilType: 'Clay Loam' },
  { _id: '12', name: 'Uttarkashi', position: [30.7333, 78.4500], altitude: 1158, terrain: 'Himalayas', soilType: 'Silty' },
  { _id: '13', name: 'Joshimath', position: [30.5605, 79.5665], altitude: 1875, terrain: 'Himalayas', soilType: 'Sandy Clay' },
  { _id: '14', name: 'Manali', position: [32.2432, 77.1892], altitude: 2050, terrain: 'Himalayas', soilType: 'Silty Loam' },

  { _id: '15', name: 'Cherrapunji', position: [25.2702, 91.7323], altitude: 1484, terrain: 'Meghalaya Plateau', soilType: 'Laterite' },
  { _id: '16', name: 'Mawsynram', position: [25.3017, 91.5820], altitude: 1400, terrain: 'Meghalaya Plateau', soilType: 'Laterite' },
  { _id: '17', name: 'Aizawl', position: [23.7271, 92.7176], altitude: 1132, terrain: 'Mizo Hills', soilType: 'Red Clay' },
  { _id: '18', name: 'Kohima', position: [25.6667, 94.1194], altitude: 1444, terrain: 'Naga Hills', soilType: 'Loamy' },

  { _id: '19', name: 'Haflong (Dima Hasao)', position: [25.1695, 93.0176], altitude: 966, terrain: 'North Cachar Hills', soilType: 'Silty Clay' },
  { _id: '20', name: 'Diphu (Karbi Anglong)', position: [25.8426, 93.4312], altitude: 186, terrain: 'Hill Region', soilType: 'Red Loam' },
  { _id: '21', name: 'Tezpur (Sonitpur)', position: [26.6338, 92.8000], altitude: 48, terrain: 'Foothills of Arunachal', soilType: 'Alluvial' },

  { _id: '22', name: 'Landsdowne', position: [29.8400, 78.6800], altitude: 1706, terrain: 'Himalayas', soilType: 'Loamy' },
  { _id: '23', name: 'Tehri Garhwal', position: [30.3833, 78.4833], altitude: 1550, terrain: 'Himalayas', soilType: 'Clay' },

  { _id: '24', name: 'Srinagar', position: [34.0837, 74.7973], altitude: 1585, terrain: 'Western Himalayas', soilType: 'Alluvial' },
  { _id: '25', name: 'Doda', position: [33.1457, 75.5483], altitude: 1100, terrain: 'Himalayas', soilType: 'Loamy' },

  { _id: '26', name: 'Raigad', position: [18.5204, 73.8567], altitude: 100, terrain: 'Konkan Ghats', soilType: 'Laterite' },
  { _id: '27', name: 'Ratnagiri', position: [16.9902, 73.3120], altitude: 50, terrain: 'Konkan Ghats', soilType: 'Laterite' },

  { _id: '28', name: 'Itanagar', position: [27.0844, 93.6053], altitude: 320, terrain: 'Eastern Himalayas', soilType: 'Red Clay' },
  { _id: '29', name: 'Tawang', position: [27.5875, 91.8598], altitude: 3048, terrain: 'Eastern Himalayas', soilType: 'Loamy' },

  { _id: '30', name: 'Idukki', position: [9.8490, 76.9842], altitude: 1200, terrain: 'Western Ghats', soilType: 'Laterite' },
  { _id: '31', name: 'Kannur', position: [11.8745, 75.3704], altitude: 50, terrain: 'Western Ghats', soilType: 'Laterite' },
  { _id: '32', name: 'Sikkim (North)', position: [27.6082, 88.5122], altitude: 1900, terrain: 'Himalayas', soilType: 'Sandy Clay' },
  { _id: '33', name: 'Pithoragarh', position: [29.5800, 80.2200], altitude: 1627, terrain: 'Himalayas', soilType: 'Loamy' },

  { _id: '34', name: 'Kullu', position: [32.0000, 77.1000], altitude: 1040, terrain: 'Himalayas', soilType: 'Silty Clay Loam' },
  { _id: '35', name: 'Pauri Garhwal', position: [30.1500, 78.7000], altitude: 1500, terrain: 'Himalayas', soilType: 'Loamy' },
  { _id: '36', name: 'Rudraprayag', position: [30.3000, 78.9500], altitude: 1300, terrain: 'Himalayas', soilType: 'Sandy Clay' },
  { _id: '37', name: 'Kinnaur', position: [31.5000, 78.2000], altitude: 2000, terrain: 'Himalayas', soilType: 'Stony Loam' },
  { _id: '38', name: 'Pithoragarh', position: [29.5800, 80.2200], altitude: 1627, terrain: 'Himalayas', soilType: 'Loamy' },
  { _id: '39', name: 'Zunheboto', position: [26.0400, 94.1150], altitude: 1720, terrain: 'Nagaland', soilType: 'Clayey Loam' },
  { _id: '40', name: 'Shillong', position: [25.5788, 91.8933], altitude: 1496, terrain: 'Meghalaya Plateau', soilType: 'Laterite' },
  { _id: '41', name: 'Ukhrul', position: [25.1400, 94.4545], altitude: 1300, terrain: 'Manipur', soilType: 'Red Sandy Loam' },
  { _id: '42', name: 'Senapati', position: [25.2500, 94.0500], altitude: 1400, terrain: 'Manipur', soilType: 'Loamy' },
  { _id: '43', name: 'Tura', position: [25.4700, 90.2170], altitude: 623, terrain: 'Meghalaya', soilType: 'Laterite' },
  { _id: '44', name: 'Agumbe', position: [13.3522, 74.9069], altitude: 627, terrain: 'Western Ghats', soilType: 'Lateritic' },
  { _id: '45', name: 'Sirsi', position: [14.6233, 74.8415], altitude: 520, terrain: 'Western Ghats', soilType: 'Red Loam' },
  { _id: '46', name: 'Sakleshpur', position: [13.0100, 75.7500], altitude: 1072, terrain: 'Western Ghats', soilType: 'Clay Loam' },
  { _id: '47', name: 'Belgaum', position: [15.8600, 74.4970], altitude: 750, terrain: 'Western Ghats', soilType: 'Lateritic' },
  { _id: '48', name: 'Sindhudurg', position: [16.0278, 73.5222], altitude: 600, terrain: 'Western Ghats', soilType: 'Lateritic' },
  { _id: '49', name: 'Satara', position: [17.6850, 73.9980], altitude: 850, terrain: 'Western Ghats', soilType: 'Clay' },
  { _id: '50', name: 'Simlipal Hills', position: [21.9650, 86.6360], altitude: 900, terrain: 'Eastern Ghats', soilType: 'Laterite' },
  { _id: '51', name: 'Araku Valley', position: [18.4100, 82.9100], altitude: 915, terrain: 'Eastern Ghats', soilType: 'Laterite' },
  { _id: '52', name: 'Raigad', position: [18.5204, 73.8567], altitude: 100, terrain: 'Konkan Ghats', soilType: 'Laterite' },
  { _id: '53', name: 'Ratnagiri', position: [16.9902, 73.3120], altitude: 50, terrain: 'Konkan Ghats', soilType: 'Laterite' },
];


const landslideProneAreas = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Western Ghats', risk: 'high', description: 'Highly susceptible due to steep slopes and heavy rainfall' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.5, 21.0], [72.5, 8.0], [77.0, 8.0], [77.0, 21.0], [72.5, 21.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Himalayan Region', risk: 'very high', description: 'Extremely susceptible due to tectonic activity and glacial melting' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.0, 35.0], [72.0, 26.0], [95.0, 26.0], [95.0, 35.0], [72.0, 35.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'North-East India', risk: 'high', description: 'Prone due to heavy rainfall and seismic activity' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.0, 28.0], [89.0, 21.0], [97.0, 21.0], [97.0, 28.0], [89.0, 28.0]
        ]]
      }
    }
  ]
};

const historicalLandslides = [
  { position: [30.7333, 79.0667], date: '2021-02-07', magnitude: 'large', description: 'Chamoli disaster' },
  { position: [18.5204, 73.8567], date: '2014-07-30', magnitude: 'medium', description: 'Pune landslide' },
  { position: [27.0360, 88.2627], date: '2015-06-13', magnitude: 'small', description: 'Darjeeling landslide' },
  { position: [11.4091, 76.6938], date: '2019-08-08', magnitude: 'medium', description: 'Ooty landslide' }
];

const RiskMap = () => {
  const [rainfallData, setRainfallData] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [loading, setLoading] = useState({ weather: true, hotspots: true });
  const [pulseRadius, setPulseRadius] = useState(5);
  const [expanding, setExpanding] = useState(true);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');


  useEffect(() => {
    const interval = setInterval(() => {
      setPulseRadius(prev => {
        if (expanding) {
          if (prev >= 15) setExpanding(false);
          return prev + 0.5;
        } else {
          if (prev <= 5) setExpanding(true);
          return prev - 0.5;
        }
      });
    }, 50);
    return () => clearInterval(interval);
  }, [expanding]);

  const fetchRainfallFromWeatherAPI = async () => {
    try {
      setLoading(prev => ({ ...prev, weather: true }));
      setError(null);

      const updatedData = await Promise.all(
        stations.map(async (station) => {
          try {
            const forecastRes = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
              params: {
                key: WEATHER_API_KEY,
                q: `${station.position[0]},${station.position[1]}`,
                days: 2
              }
            });

            let rainfall = 0;
            let rainfallTrend = 'steady';
            let forecastData = [];

            if (forecastRes.data?.forecast?.forecastday?.length > 0) {
              rainfall = forecastRes.data.forecast.forecastday[0].day.totalprecip_mm || 0;

              const prevDayRainfall = forecastRes.data.forecast.forecastday[1]?.day.totalprecip_mm || 0;
              rainfallTrend = rainfall > prevDayRainfall * 1.5 ? 'increasing' :
                rainfall < prevDayRainfall * 0.7 ? 'decreasing' : 'steady';

              forecastData = forecastRes.data.forecast.forecastday[0].hour
                .filter((_, i) => i % 3 === 0)
                .map(hour => ({
                  time: hour.time,
                  precip_mm: hour.precip_mm,
                  chance_of_rain: hour.chance_of_rain
                }));
            } else {
              const currentRes = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
                params: {
                  key: WEATHER_API_KEY,
                  q: `${station.position[0]},${station.position[1]}`,
                }
              });
              rainfall = currentRes.data?.current?.precip_mm || 0;
            }

            return {
              ...station,
              rainfall,
              rainfallTrend,
              forecastData,
              updatedAt: new Date().toISOString()
            };
          } catch (error) {
            console.error(`Failed to fetch data for ${station.name}:`, error.message);
            return {
              ...station,
              rainfall: null,
              rainfallTrend: null,
              forecastData: [],
              updatedAt: new Date().toISOString()
            };
          }
        })
      );

      setRainfallData(updatedData);
      setLoading(prev => ({ ...prev, weather: false }));
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      setError("Failed to fetch weather data. Please try again later.");
      setLoading(prev => ({ ...prev, weather: false }));
    }
  };

  const fetchHotspots = async () => {
    try {
      setLoading(prev => ({ ...prev, hotspots: true }));

      // const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${NASA_FIRMS_KEY}/VIIRS_NOAA20_NRT/IND/1`);
      // console.log(response.data);

      const mockHotspots = [
        { lat: 10.1, lon: 77.1, brightness: 320, date: new Date().toISOString() },
        { lat: 27.5, lon: 88.3, brightness: 290, date: new Date().toISOString() },
        { lat: 11.4, lon: 76.7, brightness: 310, date: new Date().toISOString() },
        { lat: 18.52, lon: 73.86, brightness: 280, date: new Date().toISOString() }
      ];

      setHotspots(mockHotspots);
      setLoading(prev => ({ ...prev, hotspots: false }));
    } catch (error) {
      console.error("Failed to fetch hotspots data:", error);
      setError("Failed to fetch fire hotspot data. Displaying cached data.");
      setLoading(prev => ({ ...prev, hotspots: false }));
    }
  };

  useEffect(() => {
    fetchRainfallFromWeatherAPI();
    fetchHotspots();

    const weatherInterval = setInterval(fetchRainfallFromWeatherAPI, 3600000);
    const hotspotsInterval = setInterval(fetchHotspots, 21600000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(hotspotsInterval);
    };
  }, []);

  const isPointInPolygon = (point, polygon) => {
    const [lat, lng] = point;
    const [minLng, minLat, maxLng, maxLat] = polygon.reduce((acc, coord) => [
      Math.min(acc[0], coord[0]),
      Math.min(acc[1], coord[1]),
      Math.max(acc[2], coord[0]),
      Math.max(acc[3], coord[1]),
    ], [Infinity, Infinity, -Infinity, -Infinity]);
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  };

  const getAreaRiskLevel = (position) => {
    const area = landslideProneAreas.features.find(area =>
      isPointInPolygon(position, area.geometry.coordinates[0])
    );
    return area ? area.properties.risk : 'low';
  };

  const calculateRiskLevel = (station) => {
    if (station.rainfall === null) return 'unknown';

    const areaRisk = getAreaRiskLevel(station.position);
    const baseRisk = areaRisk === 'very high' ? 0.9 :
      areaRisk === 'high' ? 0.7 :
        areaRisk === 'medium' ? 0.5 : 0.3;

    const rainfallRisk = station.rainfall > 200 ? 0.9 :
      station.rainfall > 100 ? 0.7 :
        station.rainfall > 50 ? 0.5 :
          station.rainfall > 0 ? 0.2 : 0;

    const trendRisk = station.rainfallTrend === 'increasing' ? 0.3 :
      station.rainfallTrend === 'decreasing' ? -0.1 : 0;

    const soilRisk = station.soilType === 'Clay' ? 0.2 :
      station.soilType === 'Silty Clay' ? 0.15 :
        station.soilType === 'Laterite' ? 0.1 : 0;

    const totalRisk = (baseRisk * 0.5) +
      (rainfallRisk * 0.3) +
      (trendRisk * 0.1) +
      (soilRisk * 0.1);

    const nearbyHotspots = hotspots.filter(h => {
      const distance = Math.sqrt(
        Math.pow(h.lat - station.position[0], 2) +
        Math.pow(h.lon - station.position[1], 2)
      );
      return distance < 0.5;
    }).length;

    const hotspotRisk = Math.min(0.3, nearbyHotspots * 0.1);

    const finalRisk = totalRisk + hotspotRisk;

    return finalRisk > 0.8 ? 'very high' :
      finalRisk > 0.6 ? 'high' :
        finalRisk > 0.4 ? 'medium' : 'low';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very high': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      case 'unknown': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const proneAreaStyle = (feature) => {
    const risk = feature.properties.risk;
    return {
      fillColor: risk === 'very high' ? '#ef4444' :
        risk === 'high' ? '#f97316' : '#f59e0b',
      fillOpacity: 0.2,
      color: risk === 'very high' ? '#dc2626' :
        risk === 'high' ? '#ea580c' : '#d97706',
      weight: 2
    };
  };

  const handleRefresh = () => {
    fetchRainfallFromWeatherAPI();
    fetchHotspots();
  };

  const renderRainfallChart = (forecastData) => {
    if (!forecastData || forecastData.length === 0) {
      return <p className="text-gray-500 text-sm">No forecast data available</p>;
    }

    const maxPrecip = Math.max(...forecastData.map(d => d.precip_mm), 5);

    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1">24h Rainfall Forecast</h4>
        <div className="flex items-end h-20 gap-1">
          {forecastData.map((hour, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t-sm"
                style={{ height: `${(hour.precip_mm / maxPrecip) * 50}px` }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(hour.time).getHours()}h
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const baseUrl = useSelector((state) => state.base.baseUrl);
  const handleGenerateReport = async () => {
    const rainfallForecast24h = activeLocation?.forecastData.map(item => 
      new Date(item.time).getHours().toString() 
    );
    const riskMessage = activeLocation.riskLevel === 'Severe'
  ? '⚠️ Severe landslide risk. Immediate action recommended. Evacuation may be necessary.'
  : activeLocation.riskLevel === 'High'
    ? '⚠️ High landslide risk. Avoid travel to the area. Monitor weather updates closely.'
    : activeLocation.riskLevel === 'Moderate'
      ? 'Moderate landslide risk. Stay alert for weather warnings.'
      : activeLocation.riskLevel === 'Low'
        ? 'Low landslide risk. Normal conditions.'
        : 'Risk assessment unavailable due to missing data.';

    try {
      const res = await axios.post(`${baseUrl}/api/reports/createReport`, {
        locationName: activeLocation.name,
        coordinates: {
          lat: activeLocation.position[0],
          lng: activeLocation.position[1]
        },
        rainfall: activeLocation.rainfall,
        rainfallStatus: activeLocation.rainfallTrend,
        terrainType: activeLocation.terrain,
        soilType: activeLocation.soilType,
        altitude: activeLocation.altitude,
        riskLevel: activeLocation.riskLevel,
        rainfallForecast24h: rainfallForecast24h,
        advisoryMessage: riskMessage,

      }, {
        withCredentials: true
      }
      )
      if (res.data) {
        toast.success("Report Generated Successfully");

      }
    } catch (error) {
      toast.error(error.message || error);
      console.error(error)
    }

  }
 const handleSendAlert = async() =>{
   try {
    const res = await axios.post(`${baseUrl}/api/alerts/createAlert`, {
      locationName : activeLocation.name,
      severity :  activeLocation.riskLevel,
      coordinates: {
        lat: activeLocation.position[0],
        lng: activeLocation.position[1]
      },

    }, {
      withCredentials : true,
    })
    if(res.data){
      toast.success("Alert Generated Sucessfully");
    }
   } catch (error) {
    toast.error(error)
    console.error(error)
   }
 }
  return (
    <div className="card bg-base-100 shadow-xl">
      <Toaster position="top-center" />
      <div className="card-body">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="card-title text-2xl font-bold">
              Landslide Risk Monitoring System
              {(loading.weather || loading.hotspots) && (
                <span className="loading loading-spinner loading-sm ml-2"></span>
              )}
            </h2>
            <p className="text-sm text-gray-600">
              Real-time monitoring of landslide risk factors across India
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="select select-sm select-bordered"
              value={activeLayer}
              onChange={(e) => setActiveLayer(e.target.value)}
            >
              <option value="all">All Layers</option>
              <option value="stations">Weather Stations</option>
              <option value="hotspots">Thermal Hotspots</option>
              <option value="proneAreas">Prone Areas</option>
              <option value="historical">Historical Events</option>
            </select>

            <select
              className="select select-sm select-bordered"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button
              className="btn btn-sm btn-primary"
              onClick={handleRefresh}
              disabled={loading.weather || loading.hotspots}
            >
              {loading.weather || loading.hotspots ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={[22.9734, 78.6569]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <LayersControl position="topright">
                {(activeLayer === 'all' || activeLayer === 'proneAreas') && (
                  <LayersControl.Overlay name="Landslide Prone Areas" checked>
                    <GeoJSON
                      data={landslideProneAreas}
                      style={proneAreaStyle}
                      onEachFeature={(feature, layer) => {
                        layer.bindPopup(`
                          <strong>${feature.properties.name}</strong><br />
                          Risk Level: ${feature.properties.risk}<br />
                          ${feature.properties.description}
                        `);
                      }}
                    />
                  </LayersControl.Overlay>
                )}

                {(activeLayer === 'all' || activeLayer === 'stations') && rainfallData.map(station => {
                  const riskLevel = calculateRiskLevel(station);
                  return (
                    <React.Fragment key={station._id}>
                      <CircleMarker
                        center={station.position}
                        radius={pulseRadius * 2}
                        fillOpacity={0.2}
                        color={getRiskColor(riskLevel)}
                        weight={1}
                        eventHandlers={{ click: () => setActiveLocation({ ...station, riskLevel }) }}
                      />
                      <CircleMarker
                        center={station.position}
                        radius={8}
                        fillColor={getRiskColor(riskLevel)}
                        fillOpacity={1}
                        color="#fff"
                        weight={1.5}
                        eventHandlers={{ click: () => setActiveLocation({ ...station, riskLevel }) }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[200px]">
                            <h3 className="font-bold">{station.name}</h3>
                            <p>Rainfall: {station.rainfall !== null ? `${station.rainfall} mm` : 'Data unavailable'}</p>
                            <p>Trend: <span className="capitalize">{station.rainfallTrend || 'unknown'}</span></p>
                            <p>Risk: <span className="capitalize font-medium">{riskLevel}</span></p>
                            <p>Terrain: {station.terrain}</p>
                            {station.updatedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Updated: {new Date(station.updatedAt).toLocaleTimeString()}
                              </p>
                            )}
                            {renderRainfallChart(station.forecastData)}
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}

                {(activeLayer === 'all' || activeLayer === 'hotspots') && hotspots.map((hotspot, i) => (
                  <CircleMarker
                    key={i}
                    center={[hotspot.lat, hotspot.lon]}
                    radius={6}
                    fillColor="#f97316"
                    fillOpacity={0.8}
                    color="#fff"
                    weight={1}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-bold">Thermal Hotspot</h3>
                        <p>Brightness: {hotspot.brightness} K</p>
                        <p>Detected: {new Date(hotspot.date).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Source: NASA FIRMS
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {(activeLayer === 'all' || activeLayer === 'historical') && historicalLandslides.map((event, i) => (
                  <CircleMarker
                    key={`event-${i}`}
                    center={event.position}
                    radius={5}
                    fillColor="#7c3aed"
                    fillOpacity={0.7}
                    color="#fff"
                    weight={1}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-bold">Historical Landslide</h3>
                        <p>Date: {event.date}</p>
                        <p>Magnitude: {event.magnitude}</p>
                        <p>Description: {event.description}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayersControl>
            </MapContainer>
          </div>

          <div className="lg:w-96 flex flex-col gap-4">
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                {activeLocation ? activeLocation.name : "Station Overview"}
              </h3>

              {activeLocation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: getRiskColor(activeLocation.riskLevel) }}
                      ></div>
                      <h4 className="font-bold text-lg">{activeLocation.name}</h4>
                    </div>
                    <span className="badge badge-outline capitalize">
                      {activeLocation.riskLevel} risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Rainfall</p>
                      <p className="font-medium">
                        {activeLocation.rainfall !== null ? `${activeLocation.rainfall} mm` : 'N/A'}
                        {activeLocation.rainfallTrend && (
                          <span className={`ml-2 text-xs ${activeLocation.rainfallTrend === 'increasing' ? 'text-red-500' :
                            activeLocation.rainfallTrend === 'decreasing' ? 'text-green-500' : 'text-gray-500'
                            }`}>
                            ({activeLocation.rainfallTrend})
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Terrain</p>
                      <p className="font-medium">{activeLocation.terrain}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Soil Type</p>
                      <p className="font-medium">{activeLocation.soilType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Altitude</p>
                      <p className="font-medium">{activeLocation.altitude} m</p>
                    </div>
                  </div>

                  {renderRainfallChart(activeLocation.forecastData)}

                  <div className="mt-2">
                    <p className="text-gray-500 mb-1">Risk Assessment</p>
                    <p className="text-sm">
                      {activeLocation.riskLevel === 'very high' ?
                        '⚠️ Very high landslide risk. Immediate action recommended. Evacuation may be necessary.' :
                        activeLocation.riskLevel === 'high' ?
                          '⚠️ High landslide risk. Avoid travel to the area. Monitor weather updates closely.' :
                          activeLocation.riskLevel === 'medium' ?
                            'Moderate landslide risk. Stay alert for weather warnings.' :
                            activeLocation.riskLevel === 'low' ?
                              'Low landslide risk. Normal conditions.' :
                              'Risk assessment unavailable due to missing data.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">Select a station on the map to view details</p>
                  <p className="text-sm">
                    This system integrates multiple data sources including:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    <li>WeatherAPI rainfall data</li>
                    <li>NASA FIRMS thermal hotspots</li>
                    <li>GSI landslide-prone areas</li>
                    <li>Historical landslide events</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Alerts & Warnings</h3>

              <div className="space-y-3">
                {/* Rainfall alerts */}
                <div className="collapse collapse-arrow bg-base-100">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title font-medium">
                    Heavy Rainfall Alerts
                    <span className="badge badge-sm ml-2">
                      {rainfallData.filter(s => s.rainfall !== null && s.rainfall > 100).length}
                    </span>
                  </div>
                  <div className="collapse-content">
                    <div className="space-y-2 mt-2">
                      {rainfallData
                        .filter(s => s.rainfall !== null && s.rainfall > 100)
                        .sort((a, b) => b.rainfall - a.rainfall)
                        .map(s => (
                          <div key={s._id} className="flex justify-between items-center p-2 bg-warning/10 rounded">
                            <div>
                              <span className="font-medium">{s.name}</span>
                              <span className="ml-2">{s.rainfall} mm</span>
                            </div>
                            <span className="badge badge-warning badge-sm">
                              {calculateRiskLevel(s)}
                            </span>
                          </div>
                        ))}
                      {rainfallData.filter(s => s.rainfall !== null && s.rainfall > 100).length === 0 && (
                        <div className="alert alert-success p-2 text-sm">
                          No heavy rainfall alerts currently
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hotspot alerts */}
                <div className="collapse collapse-arrow bg-base-100">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">
                    Thermal Hotspots
                    <span className="badge badge-sm ml-2">
                      {hotspots.length}
                    </span>
                  </div>
                  <div className="collapse-content">
                    <div className="space-y-2 mt-2">
                      {hotspots.length > 0 ? (
                        hotspots.map((h, i) => (
                          <div key={i} className="p-2 bg-error/10 rounded text-sm">
                            <p className="font-medium">Hotspot #{i + 1}</p>
                            <p>Location: {h.lat.toFixed(2)}, {h.lon.toFixed(2)}</p>
                            <p>Brightness: {h.brightness} K</p>
                          </div>
                        ))
                      ) : (
                        <div className="alert alert-info p-2 text-sm">
                          No thermal hotspots detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Legend</h3>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <span>Very High Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span>High Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Medium Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Low Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span>Data Unavailable</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>Historical Event</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                  <span>Thermal Hotspot</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-red-500 rounded-full mr-2"></div>
                  <span>Prone Area</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>Data sources: WeatherAPI, NASA FIRMS, Geological Survey of India (GSI)</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>

          <div className="flex gap-2">
            <div className="tooltip" data-tip="Generate Report" onClick={handleGenerateReport}>
              <button className="btn btn-sm btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
            <div className="tooltip" data-tip="Send Alert" onClick={handleSendAlert}>
              <button className="btn btn-sm btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMap;