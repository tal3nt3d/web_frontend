import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import { getDevice } from '../../modules/devicesApi';
import type { Device } from '../../modules/devicesApi';
import { Spinner } from 'react-bootstrap';
import Header from '../../components/Header/Header';
import { DEVICES_MOCK } from '../../modules/mock'; 
import './DevicePage.css';

export default function DevicePage() {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    
    const fetchDevice = async () => {
      try {
        setLoading(true);
        const deviceData = await getDevice(Number(id));
        
        if (!deviceData) {
          const mockDevice = DEVICES_MOCK.find(d => d.device_id === Number(id)) || null;
          setDevice(mockDevice);
        } else {
          setDevice(deviceData);
        }
      } catch (error) {
        console.error('Error fetching device, using mocks:', error);
        const mockDevice = DEVICES_MOCK.find(d => d.device_id === Number(id)) || null;
        setDevice(mockDevice);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);


  const getImageUrl = (photo: string) => {
    if (!photo || imageError) return '/src/assets/device_error.png';

    return `http://localhost:9000/test/${photo}`;
  };


  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="device-page">
        <Header />
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="device-page">
        <Header />
        <div className="device-not-found">
          <h1>Устройство не найдено</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="device-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.Devices, path: ROUTES.Devices },
          { label: device.title },
        ]}
      />

      <div className="order-card">
  <img 
    src={getImageUrl(device.photo)} 
    alt={device.title}
    onError={handleImageError}
    className="image"
  />
  <div className="row">
    <h1>{device.title}</h1>
    <p>{device.dev_power} кВт</p>
    <p>{device.description}</p>
  </div>
</div>
    </div>
  );
}