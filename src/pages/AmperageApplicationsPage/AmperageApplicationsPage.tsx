import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api';
import './AmperageApplicationsPage.css';

export default function ResearchesPage() {
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAppSelector(state => state.user);
  const [amperageApplications, setAmperageApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    loadAmperageApplications();
  }, [isAuthenticated, navigate]);

console.log('Amperage applications:', amperageApplications);

  const loadAmperageApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.amperageApplication.allAmperageApplicationsList();
      setAmperageApplications(response.data);
    } catch (error: any) {
      setError(error.response?.data?.description || 'Ошибка загрузки расчётов');
    } finally {
      setLoading(false);
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
            <div className="empty-researches">
              <p>Расчёты не найдены</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}