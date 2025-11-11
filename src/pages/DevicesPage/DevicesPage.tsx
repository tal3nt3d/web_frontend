import { useEffect } from 'react';
import Header from '../../components/Header/Header';
import Search from '../../components/InputField/InputField';
import DevicesList from '../../components/DevicesList/DevicesList';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import CartButton from '../../components/CartButton/CartButton';
import { ROUTE_LABELS } from '../../Routes';
import { listDevices } from '../../modules/devicesApi';
import { DEVICES_MOCK } from '../../modules/mock'; 
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDevices, setLoading } from '../../store/slices/deviceSlice';
import { setSearchName, addToHistory } from '../../store/slices/searchSlice';
import './DevicesPage.css';

export default function DevicesPage() {
  const dispatch = useAppDispatch();
  const { devices, loading } = useAppSelector(state => state.devices);
  const { searchTitle } = useAppSelector(state => state.search);

  const loadData = async (searchQuery?: string) => {
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
    loadData(searchTitle);
  }, []);

  const handleSearch = async () => {
    if (searchTitle) {
      dispatch(addToHistory(searchTitle));
    }
    await loadData(searchTitle);
  };


  const handleCartClick = async () => {
    try {
      const response = await fetch('/api/v1/amperage_application/amperage_application-cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      console.log('Cart request successful');
      
    } catch (error) {
      console.error('Error making cart request:', error);
    }
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
       <CartButton onClick={handleCartClick} />
    </div>
  );
}