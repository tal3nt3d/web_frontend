import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

interface DeviceCart {
  id?: number;
  devices_count?: number;
  devices?: any[];
  status?: string;
  creator_login?: string;
  date_create?: string;
  date_research?: string;
}

interface Device {
  id: number;
  title: string;
  description: string;
  dev_power: number;
  device_id?: number;
  is_delete?: boolean;
}

interface AmperageApplicationDetail {
  id: number;
  amount: number;
  amperage?: number;
  amperage_application_id?: number;
  app_dev_id?: number;
  device_id?: number;
  notes?: string;
  devices?: Device[];
  date_research?: string;
  [key: string]: any;
}

interface AmperageApplicationState {
  application_id?: number;
  devices_count: number;
  loading: boolean;
  amperageApplicationCart: DeviceCart | null;
  error: string | null;
  amperageApplicationDetail: AmperageApplicationDetail | null;
  saveLoading: {
    date: boolean;
    devices: { [key: number]: boolean };
  };
}

const initialState: AmperageApplicationState = {
  application_id: undefined,
  devices_count: 0,
  loading: false,
  amperageApplicationCart: null,
  amperageApplicationDetail: null,
  error: null,
  saveLoading: {
    date: false,
    devices: {}
  }
};

export const getAmperageApplicationCart = createAsyncThunk(
  'amperageApplication/getDeviceCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.amperageApplicationCartList();
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { devices_count: 0, devices: [] };
      }
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки корзины');
    }
  }
);

export const addToAmperageApplication = createAsyncThunk(
  'amperageApplication/addToAmperageApplication',
  async (deviceId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.device.addToAmperageApplicationCreate(deviceId);
      dispatch(getAmperageApplicationCart());
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        dispatch(getAmperageApplicationCart());
        return { message: 'already_added' };
      }
      return rejectWithValue(error.response?.data?.description || 'Ошибка добавления');
    }
  }
);

export const removeFromAmperageApplication = createAsyncThunk(
  'amperageApplication/removeFromAmperageApplication',
  async ({ deviceId, applicationId }: { deviceId: number; applicationId: number }, { rejectWithValue }) => {
    try {
      const response = await api.devApp.devAppDelete(deviceId, applicationId);
      return { deviceId, applicationId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления');
    }
  }
);

export const getAmperageApplicationDetail = createAsyncThunk(
  'amperageApplication/getAmperageApplicationDetail',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.amperageApplicationDetail(applicationId);
      const data = response.data;
      const normalizedData: AmperageApplicationDetail = {
        id: data.id,
        amount: data.amount || data.devices_count || 0,
        amperage: data.amperage,
        amperage_application_id: data.amperage_application_id,
        app_dev_id: data.app_dev_id,
        device_id: data.device_id,
        devices: data.devices || [],
        date_research: data.date_research,
        ...data
      };
      return normalizedData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки заявки');
    }
  }
);

export const deleteAmperageApplication = createAsyncThunk(
  'amperageApplication/deleteAmperageApplication',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.deleteAmperageApplicationDelete(applicationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления заявки');
    }
  }
);

export const updateAmperageApplicationDate = createAsyncThunk(
  'amperageApplication/updateAmperageApplicationDate',
  async ({ applicationId, amperage }: { applicationId: number; amperage: number }, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.editAmperageApplicationUpdate(applicationId, {
        amperage: amperage
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления силы тока');
    }
  }
);

export const updateDeviceAmperage = createAsyncThunk(
  'amperageApplication/updateDeviceAmperage',
  async ({ 
    deviceId, 
    applicationId, 
    amperage 
  }: { 
    deviceId: number; 
    applicationId: number; 
    amperage: number 
  }, { rejectWithValue }) => {
    try {
      const response = await api.devApp.devAppUpdate(
        deviceId, 
        applicationId, 
        { amperage: amperage }
      );
      return { deviceId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления силы тока');
    }
  }
);

export const formAmperageApplication = createAsyncThunk(
  'amperageApplication/formAmperageApplication',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.formAmperageApplicationUpdate(applicationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка подтверждения заявки');
    }
  }
);

const amperageApplicationSlice = createSlice({
  name: 'amperageApplication',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAmperageApplication: (state) => {
      state.amperageApplicationCart = null;
      state.devices_count = 0;
      state.application_id = undefined;
    },
    removeDeviceOptimistic: (state, action) => {
      const deviceId = action.payload;
      if (state.amperageApplicationDetail) {
        const devices = state.amperageApplicationDetail.devices || [];
        const updatedDevices = devices.filter(device => device.id !== deviceId);
        
        state.amperageApplicationDetail.devices = updatedDevices;
        state.amperageApplicationDetail.amount = updatedDevices.length;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAmperageApplicationCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAmperageApplicationCart.fulfilled, (state, action) => {
        state.loading = false;
        state.amperageApplicationCart = action.payload;
        state.devices_count = action.payload.devices_count || 0;
        state.application_id = action.payload.id;
      })
      .addCase(getAmperageApplicationCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.amperageApplicationCart = null;
        state.devices_count = 0;
        state.application_id = undefined;
      })
      
      .addCase(getAmperageApplicationDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.amperageApplicationDetail = null;
      })
      .addCase(getAmperageApplicationDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.amperageApplicationDetail = action.payload;
      })
      .addCase(getAmperageApplicationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.amperageApplicationDetail = null;
      })
      
      .addCase(deleteAmperageApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAmperageApplication.fulfilled, (state) => {
        state.loading = false;
        state.amperageApplicationDetail = null;
        state.amperageApplicationCart = null;
        state.devices_count = 0;
        state.application_id = undefined;
      })
      .addCase(deleteAmperageApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateAmperageApplicationDate.pending, (state) => {
        state.saveLoading.date = true;
        state.error = null;
      })
      .addCase(updateAmperageApplicationDate.fulfilled, (state, action) => {
        state.saveLoading.date = false;
        if (state.amperageApplicationDetail) {
          state.amperageApplicationDetail.amperage = action.meta.arg.amperage;
        }
      })
      .addCase(updateAmperageApplicationDate.rejected, (state, action) => {
        state.saveLoading.date = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateDeviceAmperage.pending, (state, action) => {
        const { deviceId } = action.meta.arg;
        state.saveLoading.devices[deviceId] = true;
        state.error = null;
      })
      .addCase(updateDeviceAmperage.fulfilled, (state, action) => {
        const { deviceId } = action.meta.arg;
        state.saveLoading.devices[deviceId] = false;
        
        if (state.amperageApplicationDetail) {
          const devices = state.amperageApplicationDetail.devices || [];
          const updatedDevices = devices.map(device => 
            device.id === deviceId 
              ? { ...device, amperage: action.meta.arg.amperage }
              : device
          );
          
          state.amperageApplicationDetail.devices = updatedDevices;
        }
      })
      .addCase(updateDeviceAmperage.rejected, (state, action) => {
        const { deviceId } = action.meta.arg;
        state.saveLoading.devices[deviceId] = false;
        state.error = action.payload as string;
      })
      
      .addCase(removeFromAmperageApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromAmperageApplication.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromAmperageApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(formAmperageApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(formAmperageApplication.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(formAmperageApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAmperageApplication, removeDeviceOptimistic } = amperageApplicationSlice.actions;
export default amperageApplicationSlice.reducer;