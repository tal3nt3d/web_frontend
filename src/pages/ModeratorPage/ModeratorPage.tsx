import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './ModeratorPage.css';

interface AmperageApplication {
  amperage_application_id: number;
  creator_login: string;
  status: string;
  created_at: string;
  amperage?: number;
  form_date?: string;
  finish_date?: string;
  moderator_login?: string;
}

export default function ModeratorPage() {
  const navigate = useNavigate();
  
  const { isAuthenticated, username } = useAppSelector(state => state.user);
  const [amperage_applications, setAmperageApplications] = useState<AmperageApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');

  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    checkModeratorRights();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadAmperageApplications();
    
    const interval = setInterval(() => {
      setPollingCount(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [pollingCount, statusFilter, dateFrom, dateTo, creatorFilter]);

  const checkModeratorRights = async () => {
    try {
      const response = await api.users.infoList(username);
      if (!response.data.is_moderator) {
        navigate('/signin');
      }
    } catch (error) {
      setError('Ошибка проверки прав доступа');
    }
  };

  const loadAmperageApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFrom) params['from-date'] = dateFrom;
      if (dateTo) params['to-date'] = dateTo;
      
      const response = await api.amperageApplication.allAmperageApplicationsList(params);
      
      let filteredAmperageApplications = response.data;

     if (creatorFilter.trim()) {
      filteredAmperageApplications = filteredAmperageApplications.filter((app: AmperageApplication) =>
        app.creator_login.toLowerCase().includes(creatorFilter.toLowerCase())
      );
    }
      
      setAmperageApplications(filteredAmperageApplications);
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
    }
  };

  const startAmperageCalculation = async (amperage_applicationId: number) => {
    try {
      const amperage_applicationResponse = await api.amperageApplication.amperageApplicationDetail(amperage_applicationId);
      const amperage_applicationData = amperage_applicationResponse.data;
      
      if (amperage_applicationData.devices && amperage_applicationData.AmperageApplicationDevices) {
        for (const device of amperage_applicationData.devices) {
          const AmperageApplicationDevice = amperage_applicationData.AmperageApplicationDevices.find(
            (pr: any) => pr.device_id === device.device_id
          );
          
          if (AmperageApplicationDevice && AmperageApplicationDevice.dev_power) {
            await fetch('http://localhost:8080/calculate-amperage/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amperage_application_id: amperage_applicationId,
                device_id: device.device_id,
                amperage: AmperageApplicationDevice.amperage,
                amount: AmperageApplicationDevice.amount
              })
            });
          }
        }
      }
      
      console.log(`Расчет нагрузки для расчёта ${amperage_applicationId} запущен`);
    } catch (error: any) {
      console.error('Ошибка запуска расчета:', error);
    }
  };

  const updateAmperageApplicationStatus = async (amperage_applicationId: number, newStatus: string) => {
    try {
      await api.amperageApplication.finishAmperageApplicationUpdate(amperage_applicationId, { status: newStatus });
      
      if (newStatus === 'completed') {
        await startAmperageCalculation(amperage_applicationId);
        alert('Расчёт одобрен! Расчет нагрузок запущен. Результаты появятся через 5-10 секунд.');
      } else {
        alert(`Статус исследования изменен на "${getStatusText(newStatus)}"`);
      }
      
      loadAmperageApplications();
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка обновления статуса');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Черновик',
      'formed': 'Сформирована', 
      'completed': 'Завершена',
      'rejected': 'Отклонена',
      'declined': 'Отклонена',
      'finished': 'Завершена'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
      'draft': 'status-draft',
      'formed': 'status-formed',
      'completed': 'status-completed',
      'rejected': 'status-rejected',
      'declined': 'status-rejected',
      'finished': 'status-completed'
    };
    return classMap[status] || '';
  };

  const canChangeStatus = (currentStatus: string) => {
    return currentStatus === 'formed';
  };

  const handleRowClick = (amperage_applicationId: number, e: React.MouseEvent) => {
    // Проверяем, был ли клик на кнопке действий
    if ((e.target as HTMLElement).closest('.actions-cell')) {
      e.stopPropagation();
      return;
    }
    navigate(`/amperage_application/${amperage_applicationId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const filteredAmperageApplications = statusFilter === 'all' 
    ? amperage_applications 
    : amperage_applications.filter(amperage_application => amperage_application.status === statusFilter);

  return (
    <div className="moderator-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.Applications, path: '/amperage_applications' },
          { label: 'Панель модератора' },
        ]}
      />
      
      <main>
        <div className="moderator-header">
          <h1>Панель модератора</h1>
          <p>Управление расчётами пользователей</p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="moderator-filters">
          <div className="filter-group">
            <label>Статус:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="content-list-section"
            >
              <option value="all">Все статусы</option>
              <option value="formed">Сформированы</option>
              <option value="finished">Завершены</option>
              <option value="declined">Отклонены</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Дата от:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="content-list-section"
            />
          </div>

          <div className="filter-group">
            <label>Дата до:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="content-list-section"
            />
          </div>

          <div className="filter-group">
            <label>Создатель:</label>
            <input
              type="text"
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              placeholder="Фильтр по логину"
              className="content-list-section"
            />
          </div>

          <button onClick={loadAmperageApplications} className="btn-refresh">
            Обновить
          </button>
        </div>

        <div className="amperage-applications-table-container">
          {loading ? (
            <div className="loading">Загрузка исследований...</div>
          ) : filteredAmperageApplications.length > 0 ? (
            <table className="moderator-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Создатель</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                  <th>Дата формирования</th>
                  <th>Дата завершения</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmperageApplications.map((amperage_application) => (
                  <tr key={amperage_application.amperage_application_id}
                  className = "clickable-row"
                   onClick={(e) => handleRowClick(amperage_application.amperage_application_id, e)}>
                    <td className="amperage_application-id">{amperage_application.amperage_application_id}</td>
                    <td>{amperage_application.creator_login}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(amperage_application.status)}`}>
                        {getStatusText(amperage_application.status)}
                      </span>
                    </td>
                    <td>{new Date(amperage_application.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>{amperage_application.form_date ? new Date(amperage_application.form_date).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>{amperage_application.finish_date ? new Date(amperage_application.finish_date).toLocaleDateString('ru-RU') : '—'}</td>
                    <td className="actions-cell" onClick={handleActionClick}>
                      {canChangeStatus(amperage_application.status) && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => updateAmperageApplicationStatus(amperage_application.amperage_application_id, 'completed')}
                          >
                            Одобрить
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => updateAmperageApplicationStatus(amperage_application.amperage_application_id, 'rejected')}
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-amperage_applications">
              <p>Расчёты не найдены</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}