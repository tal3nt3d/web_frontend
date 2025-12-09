import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './AmperageApplicationsPage.css';

export default function AmperageApplicationsPage() {
  const navigate = useNavigate();
  const location = useLocation()
  
  const { isAuthenticated } = useAppSelector(state => state.user);
  const [amperageApplications, setAmperageApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadAmperageApplications();
  }, [isAuthenticated, navigate, location.key]);

  const loadAmperageApplications = async (filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    setLoading(true);
    setError('');
    
    try {
      const query: any = {};
      if (filters?.status) query.status = filters.status;
      if (filters?.fromDate) query['from-date'] = filters.fromDate;
      if (filters?.toDate) query['to-date'] = filters.toDate;

      const response = await api.amperageApplication.allAmperageApplicationsList(query);
      setAmperageApplications(response.data);
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (fromDateFilter) filters.fromDate = fromDateFilter;
    if (toDateFilter) filters.toDate = toDateFilter;
    
    setFiltersApplied(true);
    loadAmperageApplications(filters);
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

  const handleAmperageApplicationClick = (amperageApplicationId: number) => {
    navigate(`/amperage_application/${amperageApplicationId}`);
  };

  if (loading) {
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
          <h1>Мои расчёты</h1>
          <p>Всего расчётов: {amperageApplications.length}</p>
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
          {amperageApplications.length > 0 ? (
            <div className="amperage-applications-table-wrapper">
              <div className="amperage-applications-table-header">
                <span className="amperage-applications-id-header">ID</span>
                <span className="status-header">Статус</span>
                <span className="creator-header">Создатель</span>
                <span className="date-create-header">Дата создания</span>
                <span className="date-forming-header">Дата формирования</span>
                <span className="date-finish-header">Дата завершения</span>
                <span className="moderator-header">Модератор</span>
              </div>

              <div className="amperage-applications-table-body">
                {amperageApplications.map((amperage_application) => (
                  <div 
                    key={amperage_application.amperage_application_id}
                    className="amperage-applications-table-row"
                    onClick={() => handleAmperageApplicationClick(amperage_application.amperage_application_id)}
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