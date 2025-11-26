import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

interface DeviceCart {
  id?: number;
  devices_count?: number;
  devices?: any[];
  status?: string;
  creator_login?: string;
  date_create?: string;
  date_form?: string;
}

interface AmperageApplicationDevice {
  device_id: number;
  title: string;
  description: string;
  dev_power: number;
  amount?: number;
}

interface AmperageApplicationDetail {
  id: number;
  amount: number;
  amperage?: number;
  amperage_application_id?: number;
  app_dev_id?: number;
  device_id?: number;
  notes?: string;
  devices?: AmperageApplicationDevice[];
  amperage_application_devices?: AmperageApplicationDevice[];
  [key: string]: any;
}

interface AmperageApplicationState {
  amperage_application_id?: number;
  devices_count: number;
  loading: boolean;
  amperageApplicationCart: DeviceCart | null;
  error: string | null;
  amperageApplicationDetail: AmperageApplicationDetail | null;
  saveLoading: {
    amount: boolean;
    devices: { [key: number]: boolean };
  };
}

const initialState: AmperageApplicationState = {
  amperage_application_id: undefined,
  devices_count: 0,
  loading: false,
  amperageApplicationCart: null,
  amperageApplicationDetail: null,
  error: null,
  saveLoading: {
    amount: false,
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
  async ({ deviceId, amperageApplicationId }: { deviceId: number; amperageApplicationId: number }, { rejectWithValue }) => {
    try {
      const response = await api.devApp.devAppDelete(deviceId, amperageApplicationId);
      return { deviceId, amperageApplicationId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления');
    }
  }
);

export const getAmperageApplicationDetail = createAsyncThunk(
  'amperageApplication/getAmperageApplicationDetail',
  async (amperageApplicationId: number, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.amperageApplicationDetail(amperageApplicationId);
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
  async (amperageApplicationId: number, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.deleteAmperageApplicationDelete(amperageApplicationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления заявки');
    }
  }
);

export const updateAmperageApplicationAmperage = createAsyncThunk(
  'amperageApplication/updateAmperageApplicationAmperage',
  async ({ amperageApplicationId, amperage }: { amperageApplicationId: number; amperage: number }, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.editAmperageApplicationUpdate(amperageApplicationId, {
        amperage: amperage
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления силы тока');
    }
  }
);

export const updateDeviceAmount = createAsyncThunk(
  'amperageApplication/updateDeviceAmperage',
  async ({ 
    deviceId, 
    amperageApplicationId, 
    amount 
  }: { 
    deviceId: number; 
    amperageApplicationId: number; 
    amount: number 
  }, { rejectWithValue }) => {
    try {
      const response = await api.devApp.devAppUpdate(
        deviceId, 
        amperageApplicationId, 
        { amount: amount  }
      );
      return { deviceId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления силы тока');
    }
  }
);

export const formAmperageApplication = createAsyncThunk(
  'amperageApplication/formAmperageApplication',
  async (amperageApplicationId: number, { rejectWithValue }) => {
    try {
      const response = await api.amperageApplication.formAmperageApplicationUpdate(amperageApplicationId);
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
      state.amperage_application_id = undefined;
    },
    removeDeviceOptimistic: (state, action) => {
      const deviceId = action.payload;
      if (state.amperageApplicationDetail) {
        const devices = state.amperageApplicationDetail.devices || [];
        const updatedDevices = devices.filter(device => device.device_id !== deviceId);
        
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
        state.amperage_application_id = action.payload.id;
      })
      .addCase(getAmperageApplicationCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.amperageApplicationCart = null;
        state.devices_count = 0;
        state.amperage_application_id = undefined;
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
        state.amperage_application_id = undefined;
      })
      .addCase(deleteAmperageApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateAmperageApplicationAmperage.pending, (state) => {
        state.saveLoading.amount = true;
        state.error = null;
      })
      .addCase(updateAmperageApplicationAmperage.fulfilled, (state, action) => {
        state.saveLoading.amount = false;
        if (state.amperageApplicationDetail) {
          state.amperageApplicationDetail.amperage = action.meta.arg.amperage;
        }
      })
      .addCase(updateAmperageApplicationAmperage.rejected, (state, action) => {
        state.saveLoading.amount = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateDeviceAmount.pending, (state, action) => {
        const { deviceId } = action.meta.arg;
        state.saveLoading.devices[deviceId] = true;
        state.error = null;
      })
      .addCase(updateDeviceAmount.fulfilled, (state, action) => {
        const { deviceId } = action.meta.arg;
        state.saveLoading.devices[deviceId] = false;
        
        if (state.amperageApplicationDetail) {
          const devices = state.amperageApplicationDetail.devices || [];
          const updatedDevices = devices.map(device => 
            device.device_id === deviceId 
              ? { ...device, amount: action.meta.arg.amount }
              : device
          );
          
          state.amperageApplicationDetail.devices = updatedDevices;
        }
      })
      .addCase(updateDeviceAmount.rejected, (state, action) => {
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