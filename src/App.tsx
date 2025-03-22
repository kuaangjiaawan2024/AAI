import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { Navigation2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocate = useCallback(() => {
    setLocating(true);
    setError(null);

    if (!window.isSecureContext) {
      setError('定位功能需要在HTTPS环境下使用');
      setLocating(false);
      return;
    }

    if ('geolocation' in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition: LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
          map.setView(newPosition, 15);
          setLocating(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          let errorMessage = '无法获取位置';
          switch(err.code) {
            case 1:
              errorMessage = '请在浏览器设置中允许访问位置信息';
              break;
            case 2:
              errorMessage = '获取位置失败，请检查GPS是否开启';
              break;
            case 3:
              errorMessage = '获取位置超时，请重试';
              break;
          }
          setError(errorMessage);
          setLocating(false);
        },
        options
      );
    } else {
      setError('您的浏览器不支持地理定位功能');
      setLocating(false);
    }
  }, [map]);

  return (
    <>
      {error && (
        <div className="absolute bottom-20 right-6 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md max-w-xs">
          {error}
        </div>
      )}
      <button
        onClick={handleLocate}
        className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={locating}
      >
        <Navigation2 className={`h-6 w-6 text-blue-500 ${locating ? 'animate-spin' : ''}`} />
      </button>
    </>
  );
}

function App() {
  // 默认位置设置为北京天安门
  const defaultPosition: LatLngTuple = [39.9042, 116.4074];
  const [position, setPosition] = useState<LatLngTuple>(defaultPosition);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取用户地理位置
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          let errorMessage = '无法获取您的位置，使用默认位置';
          switch(err.code) {
            case 1:
              errorMessage = '请在浏览器设置中允许访问位置信息，当前使用默认位置';
              break;
            case 2:
              errorMessage = '获取位置失败，请检查GPS是否开启，当前使用默认位置';
              break;
            case 3:
              errorMessage = '获取位置超时，当前使用默认位置';
              break;
          }
          setError(errorMessage);
          setLoading(false);
          console.error('Error getting location:', err);
        }
      );
    } else {
      setError('您的浏览器不支持地理定位');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Navigation2 className="animate-spin h-6 w-6 text-blue-500" />
          <span className="text-lg">正在获取位置...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
            {error}
          </div>
        </div>
      )}
      
      <div className="w-screen h-screen">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">您在这里</p>
                <p className="text-sm text-gray-600">
                  {position[0].toFixed(4)}, {position[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
          <LocationButton />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;