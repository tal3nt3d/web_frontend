export interface Device {
  device_id:    number
	photo:        string               
	title:        string     
	description:  string            
  dev_power:    number                     
	is_delete:    boolean 
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function listDevices(params?: { title?: string}): Promise<Device[]> {
  try {
    let path = API_BASE_URL + "/devices";
    console.log(path);
    if (params) {
      const query = new URLSearchParams();
      if (params.title) query.append("device_title", params.title);
      const queryString = query.toString();
      if (queryString) path += `?${queryString}`;
    }

    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function getDevice(id: number): Promise<Device | null> {
  try {
    let path = API_BASE_URL + "/device/" + id;
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}