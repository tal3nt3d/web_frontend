export interface Device {
  device_id:    number
	photo:        string               
	title:        string     
	description:  string            
  dev_power:    number                     
	is_delete:    boolean 
}

export async function listDevices(params?: { title?: string}): Promise<Device[]> {
  try {
    const API_BASE = "https://172.27.61.159:8080";
    let path = `${API_BASE}/api/v1/devices`;    
    if (params) {
      const query = new URLSearchParams();
      if (params.title) query.append("device_title", params.title);
      const queryString = query.toString();
      if (queryString) path += `?${queryString}`;
    }

    const res = await fetch(path, { headers: { Accept: "application/json" } });  
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log("Fetched JSON:", json);
    const data = Array.isArray(json)
      ? json
      : json.data || json.devices || [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function getDevice(id: number): Promise<Device | null> {
  try {
    const API_BASE = "https://172.27.61.159:8080";
    const path = `${API_BASE}/api/v1/device/${id}`;
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}