import { Link } from "react-router-dom";
import type { Device } from "../../modules/devicesApi";
import './DeviceCard.css';
import { useState, useEffect } from 'react';
import defaultDeviceImage from '../../assets/device_error.png';

export default function DeviceCard({ device }: { device: Device; }) {
    const [imageError, setImageError] = useState(false);
    
    const getImageUrl = (photo: string) => {
        if (!photo) return defaultDeviceImage;
        const API_BASE = "http://172.27.61.159:9000";
        let path = `${API_BASE}/test/${photo}`; 

        return path;
    };

    const [imageUrl, setImageUrl] = useState(getImageUrl(device.photo));

    useEffect(() => {
        if (!device.photo) {
            setImageUrl(defaultDeviceImage);
        } else {
            setImageUrl(getImageUrl(device.photo));
        }
    }, [device.photo]);

    const handleImageError = () => {
        setImageError(true);
        setImageUrl(defaultDeviceImage);
    };

    // const handleAddToApplication = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         const response = await fetch('/application/add', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 device_id: device.id
    //             })
    //         });
            
    //         if (response.ok) {
    //             alert('Устройство добавлено в заявку');
    //         } else {
    //             alert('Ошибка при добавлении устройства');
    //         }
    //     } catch (error) {
    //         console.error('Error adding device to application:', error);
    //         alert('Ошибка при добавлении устройства');
    //     }
    // };

    return (
        <div className="card">
            <img 
                src={imageError ? defaultDeviceImage : imageUrl}
                alt={device.title}
                onError={handleImageError}
            />
            <h1>{device.title}</h1>
            <p>{device.dev_power} кВт</p>
            <div className="card-buttons">
                <Link to={`/device/${device.device_id}`} className="card-button">
                    Подробнее
                </Link>
                {/* <form onSubmit={handleAddToApplication} style={{ display: 'inline' }}>
                    <input type="hidden" name="device_id" value={device.device_id} />
                    <button type="submit" className="card-application-button">
                        Добавить
                    </button>
                </form> */}
            </div>
        </div>
    );
}