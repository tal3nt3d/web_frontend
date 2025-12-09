import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  getAmperageApplicationDetail, 
  deleteAmperageApplication,
  updateAmperageApplicationAmperage,
  updateDeviceAmount,
  removeFromAmperageApplication,
  formAmperageApplication
} from '../../store/slices/amperage_applicationSlice';
import './AmperageApplicationPage.css';
import defaultDevice from '../../assets/device_error.png';
import trashIcon from '../../assets/trash.svg';

export default function AmperageApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { amperageApplicationDetail, loading, saveLoading } = useAppSelector(state => state.amperage_application);
  const { isAuthenticated } = useAppSelector(state => state.user);
  
  const [amperage, setAmperage] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const amperageApplicationId = id ? parseInt(id, 10) : null;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (amperageApplicationDetail) {
      const appData = getAmperageApplicationData();
      const loadedAmperage = appData?.amperage || appData?.amperage_application?.amperage || 0;
      setAmperage(loadedAmperage);
    }
  }, [amperageApplicationDetail]);

  // const isDraft = () => {
  //    const status = amperageApplicationDetail?.research?.status || amperageApplicationDetail?.status;
  //    return status === 'draft';
  // };

  const getDevices = () => {
    if (!amperageApplicationDetail) return [];
    
    const devices = amperageApplicationDetail.devices || [];
    
    const deviceApplications = amperageApplicationDetail.amperage_applicationDevices || [];
    
    const mergedDevices = devices.map(device => {
      const deviceApplication = deviceApplications.find((da: any) => 
        da.device_id === device.device_id
      );
      
      return {
        ...device,
        id: device.device_id,
        amount: deviceApplication?.amount || 1,
        device_application_id: deviceApplication?.id,
        amperage: deviceApplication?.amperage || 0,
      };
    });

    return mergedDevices;
  };

  const getAmperageApplicationData = () => {
    return amperageApplicationDetail?.amperage_application || amperageApplicationDetail;
  };

  useEffect(() => {
    if (amperageApplicationId && isAuthenticated) {
      dispatch(getAmperageApplicationDetail(amperageApplicationId));
    }
    
  }, [amperageApplicationId, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleImageError = (deviceId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [deviceId]: true
    }));
  };

  const getImageUrl = (device: any) => {
    if (imageErrors[device.device_id] || !device.photo) {
      return defaultDevice;
    }
    return `http://192.168.195.38:9000/test/${device.photo}`;
  };

  const handleSaveAmperage = async () => {
    if (!amperageApplicationId || !(currentStatus === "draft")) return;
    
    try {
      await dispatch(updateAmperageApplicationAmperage({
        amperageApplicationId,
        amperage: amperage 
      })).unwrap();
      
      showNotification('success', 'Нагрузка успешно сохранена!');
    } catch (error: any) {
      showNotification('error', 'Ошибка сохранения нагрузки: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const handleSaveDeviceAmount = async (deviceId: number, amount: number) => {
    if (!amperageApplicationId || !(currentStatus === "draft")) return;
    
    if (amount < 0) {
      showNotification('error', 'Количество должно быть больше 0');
      return;
    }
    
    try {
      await dispatch(updateDeviceAmount({
        deviceId,
        amperageApplicationId,
        amount: amount
      })).unwrap();
      
      showNotification('success', 'Количество сохранено!');

      dispatch(getAmperageApplicationDetail(amperageApplicationId));

    } catch (error: any) {
      showNotification('error', 'Ошибка сохранения количества: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const handleRemoveDevice = async (deviceId: number) => {
    if (!amperageApplicationId || !(currentStatus === "draft")) return;
    
    if (!window.confirm('Вы уверены, что хотите устройство из расчёта?')) {
      return;
    }
    
    try {
      await dispatch(removeFromAmperageApplication({
        deviceId,
        amperageApplicationId
      })).unwrap();
      
      dispatch(getAmperageApplicationDetail(amperageApplicationId));
      showNotification('success', 'Устройство удалено из расчёта!');
    } catch (error: any) {
      showNotification('error', 'Ошибка удаления устройства: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const handleDeleteAmperageApplication = async () => {
    if (!amperageApplicationId || !(currentStatus === "draft")) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить расчёт?')) {
      return;
    }
    
    try {
      await dispatch(deleteAmperageApplication(amperageApplicationId)).unwrap();
      showNotification('success', 'Расчёт удалён!');
      setTimeout(() => navigate('/devices'), 1000);
    } catch (error: any) {
      showNotification('error', 'Ошибка удаления расчёта: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const handleFormAmperageApplication = async () => {
    if (!amperageApplicationId || !(currentStatus === "draft")) return;
    
    if (!amperage) {
      showNotification('error', 'Укажите нагрузку!');
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      await dispatch(formAmperageApplication(amperageApplicationId)).unwrap();
      
      showNotification('success', 'Заявка оформлена!');
      
      setTimeout(() => {
        navigate('/devices');
      }, 2000);
      
    } catch (error: any) {
      showNotification('error', 'Ошибка подтверждения: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="amperage-application-page">
        <Header />
        <div className="loading">Загрузка исследования...</div>
      </div>
    );
  }

  if (!amperageApplicationDetail) {
    return (
      <div className="amperage-application-page">
        <Header />
        <div className="empty-amperage-application">
          <p>Расчёт не найден</p>
          <button 
            className="btn-primary-back"
            onClick={() => navigate('/devices')}
          >
            Перейти к устройствам
          </button>
        </div>
      </div>
    );
  }

  const amperageApplicationData = getAmperageApplicationData();
  const devices = getDevices();
  const currentStatus = amperageApplicationData?.status || 'unknown';

  const amperageApplicationDisplayId = amperageApplicationData?.id || amperageApplicationId;
;
  return (
    <div className="amperage-application-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.Devices, path: '/devices' },
          { label: `Расчёт #${amperageApplicationDisplayId}` },
        ]}
      />
      
      <main>
        <div className="amperage-application-header">
          <h1>Расчёт устройств #{amperageApplicationDisplayId}</h1>
          <p>Всего устройств: {devices.length}</p>
          <p>Статус: <strong>{currentStatus}</strong></p>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="amperage-application-table-header">
          <span className="device-title-header">Устройство</span>
          <span className="dev-power-header">Мощность устройства</span>
          <span className="amount">Количество</span>
          <span className="calculated-amperage-header">Нагрузка устройства</span>
            <input  
              type="text" 
              className="content-list-section amperage-input"
              placeholder="Введите нагрузку" 
              value={amperage}
              onChange={(e) => {
                const value = e.target.value;
                setAmperage(value === '' ? 0 : parseInt(value) || 0);
              }}
              disabled={!(currentStatus === "draft")}
            />
            { currentStatus === "draft" && (
              <button 
                className="btn-save-amperage"
                onClick={handleSaveAmperage}
                disabled={!amperage || saveLoading.amount}
              >
                {saveLoading.amount ? 'Сохранение...' : 'Сохранить нагрузку'}
              </button>
            )}
        </div>

        {devices.length > 0 ? (
          <ul className="amperage-application-grid-list">
            {devices.map((device) => (
              <DeviceRow 
                key={device.id}
                amperage={device.amperage}
                device={device}
                isDraft={(currentStatus === "draft")}
                onSaveDeviceAmount={handleSaveDeviceAmount}
                onRemoveDevice={handleRemoveDevice}
                saveLoading={saveLoading}
                getImageUrl={getImageUrl}
                handleImageError={handleImageError}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-amperage-application">
            <p>Нет устройств для расчёта</p>
          </div>
        )}

        <div className="amperage-application-actions">
          {currentStatus === "draft" ? (
            <>
              <button 
                className="btn-primary-danger" 
                onClick={handleDeleteAmperageApplication}
                disabled={submitLoading}
              >
                Удалить заявку
              </button>
              
              <button 
                className="btn-primary-confirm" 
                onClick={handleFormAmperageApplication}
                disabled={submitLoading || devices.length === 0}
              >
                {submitLoading ? 'Подтверждение...' : 'Подтвердить заявку'}
              </button>
            </>
          ) : (
            <button 
              className="btn-primary-back"
              onClick={() => navigate('/devices')}
            >
              Назад к устройствам
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function DeviceRow({ 
  device, 
  amperage,
  isDraft, 
  onSaveDeviceAmount, 
  onRemoveDevice, 
  saveLoading, 
  getImageUrl, 
  handleImageError,
}: any) {
  const [localDeviceAmount, setLocalDeviceAmount] = useState(device.amount || 1);

  const handleAmountChange = (value: number) => {
    if (!isDraft) return;
    setLocalDeviceAmount(value);
  };

  const handleSave = () => {

     console.log('DeviceRow handleSave CALLED', { 
    deviceId: device.device_id, 
    localDeviceAmount,
    isDraft 
  });
  
    const amountValue = parseFloat(localDeviceAmount);
    if (!isNaN(amountValue)) {
      onSaveDeviceAmount(device.device_id, amountValue);
    }
  };

  return (
    <li>
      <div className="amperage-application-item">
          <img 
            src={getImageUrl(device)}
            alt={device.title}
            onError={() => handleImageError(device.device_id)}
            style={{ 
              width: '200px', 
              height: '200px', 
              objectFit: 'cover',
              borderRadius: '6px',
            }}
          />

        <div className="amperage-application-item-heading">
          <div className="amperage-application-device-title">{device.title}</div>
        </div>

        <div className="dev-power-value">
          <span>{device.dev_power} кВт</span>
        </div>
        
        <div className="amount-input-container">
          <input 
            type="number" 
            step="1"
            min="1"
            max="100"
            className="content-list-section amount-input"
            placeholder="Введите количество устройств"
            value={localDeviceAmount}
            onChange={(e) => handleAmountChange(parseInt(e.target.value))}
            disabled={!isDraft}
            readOnly={!isDraft}
          />
          {isDraft && (
            <button 
              className="btn-save-amount"
              onClick={handleSave}
              disabled={saveLoading.devices?.[device.device_id] || !localDeviceAmount || parseInt(localDeviceAmount) < 0}
            >
              {saveLoading.devices?.[device.device_id] ? '...' : 'Сохранить'}
            </button>
          )}
        </div>

        {amperage !== 0 && (
          <div className="calculated-amperage">
            <span>{amperage}</span>
          </div>
        )}

        {isDraft && (
          <div className="device-actions">
            <button 
              className="btn-remove-device"
              onClick={() => onRemoveDevice(device.device_id)}
              title="Удалить устройство из расчёта"
            >
              <img src={trashIcon} alt="Удалить" className="delete-icon" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}