import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './AmperageApplicationsPage.css';

interface AmperageApplication {
  amperage_application_id: number;
  creator_login: string;
  status: string;
  created_at: string;
  form_date?: string;
  finish_date?: string;
  moderator_login?: string;
}

export default function AmperageApplicationsPage() {
  const navigate = useNavigate();
  
  const { isAuthenticated, username } = useAppSelector(state => state.user);
  const [amperageApplications, setAmperageApplications] = useState<AmperageApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModerator, setIsModerator] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');
  const [creatorFilter, setCreatorFilter] = useState<string>('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    checkModeratorRights();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPollingCount(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAmperageApplications();
    }
  }, [pollingCount, isAuthenticated]);

  const checkModeratorRights = async () => {
    try {
      if (!username) return;
      const response = await api.users.infoList(username);
      setIsModerator(response.data.is_moderator || false);
    } catch (error) {
      console.error('Ошибка проверки прав доступа');
    }
  };

  const loadAmperageApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (fromDateFilter) params['from-date'] = fromDateFilter;
      if (toDateFilter) params['to-date'] = toDateFilter;
      
      const response = await api.amperageApplication.allAmperageApplicationsList(params);
      
      let filteredApplications = response.data;
      
      if (creatorFilter.trim()) {
        filteredApplications = filteredApplications.filter((app: AmperageApplication) =>
          app.creator_login && app.creator_login.toLowerCase().includes(creatorFilter.toLowerCase())
        );
      }
      
      setAmperageApplications(filteredApplications);
      setFiltersApplied(true);
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadAmperageApplications();
  };

  const startAmperageCalculation = async (amperageApplicationId: number) => {
    try {
      const amperageApplicationResponse = await api.amperageApplication.amperageApplicationDetail(amperageApplicationId);
      const amperageApplicationData = amperageApplicationResponse.data;
      
      if (amperageApplicationData.devices && amperageApplicationData.AmperageApplicationDevices) {
        for (const device of amperageApplicationData.devices) {
          const AmperageApplicationDevice = amperageApplicationData.AmperageApplicationDevices.find(
            (pr: any) => pr.device_id === device.device_id
          );
          
          if (AmperageApplicationDevice && AmperageApplicationDevice.dev_power) {
            await fetch('http://192.168.195.38:8000/v1/calculate-amperage/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amperage_application_id: amperageApplicationId,
                device_id: device.device_id,
                amperage: AmperageApplicationDevice.amperage,
                amount: AmperageApplicationDevice.amount
              })
            });
          }
        }
      }
      
      console.log(`Расчет нагрузки для расчёта ${amperageApplicationId} запущен`);
    } catch (error: any) {
      console.error('Ошибка запуска расчета:', error);
    }
  };

  const updateAmperageApplicationStatus = async (amperageApplicationId: number, newStatus: string) => {
    try {
      await api.amperageApplication.finishAmperageApplicationUpdate(amperageApplicationId, { status: newStatus });
      
      if (newStatus === 'completed') {
        await startAmperageCalculation(amperageApplicationId);
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
      'finished': 'Завершена',
      'declined': 'Отклонена'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
      'draft': 'status-draft',
      'formed': 'status-formed',
      'completed': 'status-completed',
      'rejected': 'status-rejected',
      'finished': 'status-completed',
      'declined': 'status-rejected'
    };
    return classMap[status] || '';
  };

  const canChangeStatus = (currentStatus: string) => {
    return currentStatus === 'formed';
  };

  const handleAmperageApplicationClick = (amperageApplicationId: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.actions-cell')) {
      e.stopPropagation();
      return;
    }
    navigate(`/amperage_application/${amperageApplicationId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const filteredApplications = statusFilter 
    ? amperageApplications.filter(app => app.status === statusFilter)
    : amperageApplications;

  if (loading && !filtersApplied) {
    return (
      <div className="amperage-applications-page">
        <Header />
        <div className="loading">Загрузка исследований...</div>
      </div>
    );
  }

  return (
    <div className="amperage-applications-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.Applications },
        ]}
      />
      
      <main>
        <div className="amperage-applications-header">
          <h1>Расчёты</h1>
          <p>Всего расчётов: {filteredApplications.length}</p>
        </div>

        <div className="filters-section">
          <h2 className="filters-title">Фильтрация</h2>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">Статус расчёта</label>
              <select
                id="status-filter"
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="formed">Сформирована</option>
                <option value="finished">Завершена</option>
                <option value="declined">Отклонена</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="from-date-filter" className="filter-label">Поиск с даты</label>
              <input
                id="from-date-filter"
                type="date"
                className="filter-date-input"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="to-date-filter" className="filter-label">Поиск до даты</label>
              <input
                id="to-date-filter"
                type="date"
                className="filter-date-input"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
              />
            </div>
            
            {isModerator && (
              <div className="filter-group">
                <label htmlFor="creator-filter" className="filter-label">Создатель</label>
                <input
                  id="creator-filter"
                  type="text"
                  className="filter-input"
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  placeholder="Фильтр по логину"
                />
              </div>
            )}
          </div>
          
          <div className="filter-buttons">
            <button 
              className="apply-filters-btn"
              onClick={handleApplyFilters}
            >
              Применить фильтры
            </button>
          </div>
        
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="amperage-applications-table-container">
          {filteredApplications.length > 0 ? (
            <div className="amperage-applications-table-wrapper">
              <div className="amperage-applications-table-header">
                <span className="amperage-applications-id-header">ID</span>
                <span className="status-header">Статус</span>
                <span className="creator-header">Создатель</span>
                <span className="date-create-header">Дата создания</span>
                <span className="date-forming-header">Дата формирования</span>
                <span className="date-finish-header">Дата завершения</span>
                <span className="moderator-header">Модератор</span>
                {isModerator && <span className="actions-header">Действия</span>}
              </div>

              <div className="amperage-applications-table-body">
                {filteredApplications.map((amperage_application) => (
                  <div 
                    key={amperage_application.amperage_application_id}
                    className="amperage-applications-table-row clickable-row"
                    onClick={(e) => handleAmperageApplicationClick(amperage_application.amperage_application_id, e)}
                  >
                    <span className="amperage-applications-id">{amperage_application.amperage_application_id}</span>
                    <span className={`status-badge ${getStatusClass(amperage_application.status)}`}>
                      {getStatusText(amperage_application.status)}
                    </span>
                    <span className="creator">
                      {amperage_application.creator_login || '—'}
                    </span>
                    <span className="date-create">
                      {new Date(amperage_application.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="date-forming">
                      {amperage_application.form_date ? new Date(amperage_application.form_date).toLocaleDateString('ru-RU') : '—'}
                    </span>
                    <span className="date-finish">
                      {amperage_application.finish_date ? new Date(amperage_application.finish_date).toLocaleDateString('ru-RU') : '—'}
                    </span>
                    <span className="moderator">
                      {amperage_application.moderator_login || '—'}
                    </span>
                    {isModerator && (
                      <span className="actions-cell" onClick={handleActionClick}>
                        {canChangeStatus(amperage_application.status) && (
                          <div className="action-buttons">
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
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-amperage-applications">
              <p>
                {filtersApplied 
                  ? 'Расчёты по указанным фильтрам не найдены' 
                  : 'Расчёты не найдены'
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}