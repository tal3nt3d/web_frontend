import { Link, useNavigate } from "react-router-dom";
import type { Device } from "../../modules/devicesApi";
import './DeviceCard.css';
import { useState, useEffect } from 'react';
import defaultDeviceImage from '../../assets/device_error.png';
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { addToAmperageApplication } from "../../store/slices/amperage_applicationSlice";

export default function DeviceCard({ device }: { device: Device; }) {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const { loading } = useSelector((state: RootState) => state.amperage_application);
    
    const [imageError, setImageError] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    const getImageUrl = (photo: string) => {
        if (!photo) return defaultDeviceImage;


        return `http://localhost:9000/test/${photo}`;
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

    const handleAddToResearch = async () => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }

        setAddLoading(true);
        setAddError('');
        try {
            await dispatch(addToAmperageApplication(device.device_id)).unwrap();

            console.log('Устройство добавлено в расчёт');
        } catch (error: any) {
            if (error.response?.status === 409) {
                setAddError('Устройство уже добавлено');
            } else {
                setAddError('Ошибка добавления в расчёт');
            }
            console.error('Ошибка добавления в расчёт:', error);
        } finally {
            setAddLoading(false);
        }
    };

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
                <button 
                    onClick={handleAddToResearch}
                    disabled={addLoading || loading}
                    className={`card-application-button ${!isAuthenticated ? 'not-authenticated' : ''}`}
                >
                    {addLoading ? 'Добавление...' : 'Добавить в расчёт'}
                </button>

            </div>
        </div>
    );
}