import './DevicesList.css';
import DeviceCard from '../DeviceCard/DeviceCard';
import { type Device } from '../../modules/devicesApi';

export default function DevicesList({ devices }: {devices: Device[]}) {
  return (
    <div className="container">
      {devices.map((device) => (
        <DeviceCard key = { device.device_id } device = { device } />  
      ))}
    </div>
  );
}