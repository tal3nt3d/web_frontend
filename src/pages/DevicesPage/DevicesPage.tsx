import { useEffect } from 'react';
import Header from '../../components/Header/Header';
import Search from '../../components/InputField/InputField';
import DevicesList from '../../components/DevicesList/DevicesList';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import '../../components/CartButton/CartButton.css'
import { ROUTE_LABELS } from '../../Routes';
import { listDevices } from '../../modules/devicesApi';
import { DEVICES_MOCK } from '../../modules/mock'; 
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDevices, setLoading } from '../../store/slices/deviceSlice';
import { setSearchName, addToHistory } from '../../store/slices/searchSlice';
import { getAmperageApplicationCart } from '../../store/slices/amperage_applicationSlice';
import './DevicesPage.css';
import WrenchImage from '../../assets/wrench.svg';
import { Link } from 'react-router-dom';


export default function DevicesPage() {
  const dispatch = useAppDispatch();
  const { devices, loading } = useAppSelector(state => state.devices);
  const { searchTitle } = useAppSelector(state => state.search);
  const { isAuthenticated } = useAppSelector(state => state.user);
  const { amperageApplicationCart, devices_count } = useAppSelector(state => state.amperage_application);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAmperageApplicationCart());
    }
  }, [isAuthenticated, dispatch]);

  const loadDevices = async (searchQuery?: string) => {
    dispatch(setLoading(true));
    
    try {
      const apiData = await listDevices({ title: searchQuery });
      
      if (apiData.length > 0) {
        dispatch(setDevices(apiData));
      } else {
        let filteredMock = DEVICES_MOCK;
        if (searchQuery) {
          filteredMock = DEVICES_MOCK.filter(device =>
            device.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        dispatch(setDevices(filteredMock));
      }
    } catch (error) {
      let filteredMock = DEVICES_MOCK;
      if (searchQuery) {
        filteredMock = DEVICES_MOCK.filter(device =>
          device.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      dispatch(setDevices(filteredMock));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    loadDevices(searchTitle);
  }, []);

  const handleSearch = async () => {
    if (searchTitle) {
      dispatch(addToHistory(searchTitle));
    }
    await loadDevices(searchTitle);
  };

  return (
    <div className="devices-page">
      <Header />
      
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.Devices },
        ]}
      />
      
      <main>
        <div className="services-wrapper">

          <div className="services-search">
            <Search 
              query={searchTitle}
              onQueryChange={(value) => dispatch(setSearchName(value))}
              onSearch={handleSearch}
            />
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <div className="services-grid">
              {devices.length > 0 ? (
                <DevicesList devices={devices} />
              ) : (
                <div className="no-devices">
                  {searchTitle 
                    ? `По запросу "${searchTitle}" не было найдено ни одного устройства` 
                    : 'Устройства не найдены'
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {isAuthenticated && (amperageApplicationCart?.id &&amperageApplicationCart?.id > 0) ? (
            <Link
              to={amperageApplicationCart?.id ? `/amperage_application/${amperageApplicationCart.id}` : '#'} 
              className={`cart-button ${amperageApplicationCart?.id ? 'active' : 'inactive'}`}
              onClick={(e) => {
                if (amperageApplicationCart?.id === -1) {
                  e.preventDefault();
                  alert('Корзина пуста!');
                }
              }}
            >
              <img src={WrenchImage} alt="Корзина"/>
              {devices_count > 0 && (
                <span className="cart-badge">{devices_count}</span>
              )}
            </Link>
          ) : (
            <div 
              className="cart-button inactive"
              onClick={() => alert('Корзина неактивна, войдите в систему')}
            >
              <img src={WrenchImage} alt="Корзина"/>
            </div>
          )}
    </div>
  );
}