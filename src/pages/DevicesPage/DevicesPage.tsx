import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Search from '../../components/InputField/InputField';
import DevicesList from '../../components/DevicesList/DevicesList';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import { listDevices } from '../../modules/devicesApi';
import { DEVICES_MOCK } from '../../modules/mock'; 
import type { Device } from '../../modules/devicesApi';
import './DevicesPage.css';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (useMock) {
      setDevices(DEVICES_MOCK);
    } else {
      listDevices()
        .then((data) => {
          if (data.length > 0) {
            setDevices(data);
          } else {
            setDevices(DEVICES_MOCK);
            setUseMock(true);
          }
        })
        .catch(() => {
          setDevices(DEVICES_MOCK);
          setUseMock(true);
        });
    }
  }, [useMock]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filtered = await listDevices({ title: searchTitle });
      
      if (filtered.length > 0) {
        setDevices(filtered);
        setUseMock(false);
      } else {
        if (useMock) {
          const filteredMock = DEVICES_MOCK.filter(device =>
            device.title.toLowerCase().includes(searchTitle.toLowerCase())
          );
          setDevices(filteredMock);
        } else {
          setDevices([]);
        }
      }
    } catch (error) {
      const filteredMock = DEVICES_MOCK.filter(device =>
        device.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
      setDevices(filteredMock);
      setUseMock(true);
    } finally {
      setLoading(false);
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
              onQueryChange={setSearchTitle}
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
    </div>
  );
}