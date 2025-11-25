/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SerializerAmperageApplicationDeviceJSON {
  amount?: number;
  amperage?: number;
  amperage_application_id?: number;
  app_dev_id?: number;
  device_id?: number;
  notes?: string;
}

export interface SerializerAmperageApplicationJSON {
  amperage?: number;
  amperage_application_id?: number;
  created_at?: string;
  creator_login?: string;
  finish_date?: string;
  form_date?: string;
  moderator_login?: string;
  status?: string;
}

export interface SerializerDeviceJSON {
  description?: string;
  dev_power?: number;
  device_id?: number;
  is_delete?: boolean;
  title?: string;
}

export interface SerializerStatusJSON {
  status?: string;
}

export interface SerializerUserJSON {
  id?: string;
  is_moderator?: boolean;
  login?: string;
  password?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Amperage Application API
 * @version 1.0
 * @license MIT
 * @contact API Support <support@amperage.com> (http://localhost:8080)
 *
 * API для управления расчётами нагрузки
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  amperageApplication = {
    /**
     * @description Возвращает заявки с возможностью фильтрации по датам и статусу
     *
     * @tags amperage_applications
     * @name AllAmperageApplicationsList
     * @summary Получить список заявок на расчёт
     * @request GET:/amperage_application/all-amperage_applications
     * @secure
     */
    allAmperageApplicationsList: (
      query?: {
        /** Начальная дата (YYYY-MM-DD) */
        "from-date"?: string;
        /** Конечная дата (YYYY-MM-DD) */
        "to-date"?: string;
        /** Статус заявки */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerAmperageApplicationJSON[], Record<string, string>>(
        {
          path: `/amperage_application/all-amperage_applications`,
          method: "GET",
          query: query,
          secure: true,
          format: "json",
          ...params,
        },
      ),

    /**
     * @description Возвращает информацию о текущей заявке-черновике на расчёт пользователя
     *
     * @tags amperage_applications
     * @name AmperageApplicationCartList
     * @summary Получить корзину расчёта
     * @request GET:/amperage_application/amperage_application-cart
     * @secure
     */
    amperageApplicationCartList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/amperage_application/amperage_application-cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о заявке
     *
     * @tags amperage_applications
     * @name AmperageApplicationDetail
     * @summary Получить заявку по ID
     * @request GET:/amperage_application/{id}
     * @secure
     */
    amperageApplicationDetail: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/amperage_application/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Выполняет логическое удаление заявки
     *
     * @tags amperage_applications
     * @name DeleteAmperageApplicationDelete
     * @summary Удалить заявка
     * @request DELETE:/amperage_application/{id}/delete-amperage_application
     * @secure
     */
    deleteAmperageApplicationDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/amperage_application/${id}/delete-amperage_application`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные заявки
     *
     * @tags amperage_applications
     * @name EditAmperageApplicationUpdate
     * @summary Изменить заявка
     * @request PUT:/amperage_application/{id}/edit-amperage_application
     * @secure
     */
    editAmperageApplicationUpdate: (
      id: number,
      amperage_applicatio: SerializerAmperageApplicationJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerAmperageApplicationJSON, Record<string, string>>({
        path: `/amperage_application/${id}/edit-amperage_application`,
        method: "PUT",
        body: amperage_applicatio,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет статус заявки (только для модераторов)
     *
     * @tags amperage_applications
     * @name FinishAmperageApplicationUpdate
     * @summary Завершить заявку
     * @request PUT:/amperage_application/{id}/finish-amperage_application
     * @secure
     */
    finishAmperageApplicationUpdate: (
      id: number,
      status: SerializerStatusJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerAmperageApplicationJSON, Record<string, string>>({
        path: `/amperage_application/${id}/finish-amperage_application`,
        method: "PUT",
        body: status,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит заявку в статус "formed"
     *
     * @tags amperage_applications
     * @name FormAmperageApplicationUpdate
     * @summary Сформировать заявку
     * @request PUT:/amperage_application/{id}/form-amperage_application
     * @secure
     */
    formAmperageApplicationUpdate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerAmperageApplicationJSON, Record<string, string>>({
        path: `/amperage_application/${id}/form-amperage_application`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  devApp = {
    /**
     * @description Обновляет параметры устройства в конкретной заявке
     *
     * @tags amperage_application_devices
     * @name DevAppUpdate
     * @summary Изменить данные устройства в заявке
     * @request PUT:/dev_app/{device_id}/{amperage_application_id}
     * @secure
     */
    devAppUpdate: (
      deviceId: number,
      amperageApplicationId: number,
      data: SerializerAmperageApplicationDeviceJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        SerializerAmperageApplicationDeviceJSON,
        Record<string, string>
      >({
        path: `/dev_app/${deviceId}/${amperageApplicationId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет связь устройства и заявки
     *
     * @tags amperage_application_devices
     * @name DevAppDelete
     * @summary Удалить устройство из заявки
     * @request DELETE:/dev_app/{device_id}/{amperage_application_id}
     * @secure
     */
    devAppDelete: (
      deviceId: number,
      amperageApplicationId: number,
      params: RequestParams = {},
    ) =>
      this.request<SerializerAmperageApplicationJSON, Record<string, string>>({
        path: `/dev_app/${deviceId}/${amperageApplicationId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  device = {
    /**
     * @description Создает новое устройство и возвращает его данные
     *
     * @tags devices
     * @name CreateDeviceCreate
     * @summary Создать новое устройство
     * @request POST:/device/create-device
     * @secure
     */
    createDeviceCreate: (
      device: SerializerDeviceJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDeviceJSON, Record<string, string>>({
        path: `/device/create-device`,
        method: "POST",
        body: device,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию об устройстве по её идентификатору
     *
     * @tags devices
     * @name DeviceDetail
     * @summary Получить устройство по ID
     * @request GET:/device/{id}
     */
    deviceDetail: (id: number, params: RequestParams = {}) =>
      this.request<SerializerDeviceJSON, Record<string, string>>({
        path: `/device/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение для устройства и возвращает обновленные данные
     *
     * @tags devices
     * @name AddPhotoCreate
     * @summary Загрузить изображение устройства
     * @request POST:/device/{id}/add-photo
     * @secure
     */
    addPhotoCreate: (
      id: number,
      data: {
        /** Изображение устройства */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/device/${id}/add-photo`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет устройство в заявку-черновик пользователя
     *
     * @tags devices
     * @name AddToAmperageApplicationCreate
     * @summary Добавить устройство в расчёт
     * @request POST:/device/{id}/add-to-amperage_application
     * @secure
     */
    addToAmperageApplicationCreate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerAmperageApplicationJSON, Record<string, string>>({
        path: `/device/${id}/add-to-amperage_application`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Выполняет логическое удаление устройство по ID
     *
     * @tags devices
     * @name DeleteDeviceDelete
     * @summary Удалить устройство
     * @request DELETE:/device/{id}/delete-device
     * @secure
     */
    deleteDeviceDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/device/${id}/delete-device`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет информацию об устройстве по ID
     *
     * @tags devices
     * @name EditDeviceUpdate
     * @summary Изменить данные устройства
     * @request PUT:/device/{id}/edit-device
     * @secure
     */
    editDeviceUpdate: (
      id: number,
      device: SerializerDeviceJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDeviceJSON, Record<string, string>>({
        path: `/device/${id}/edit-device`,
        method: "PUT",
        body: device,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  devices = {
    /**
     * @description Возвращает все устройства или фильтрует по названию
     *
     * @tags devices
     * @name DevicesList
     * @summary Получить список устройств
     * @request GET:/devices
     */
    devicesList: (
      query?: {
        /** Название устройства для поиска */
        device_title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerDeviceJSON[], Record<string, string>>({
        path: `/devices`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Принимает логин/пароль, возвращает jwt-токен в формате {"token":"..."}.
     *
     * @tags users
     * @name SigninCreate
     * @summary Вход (получение токена)
     * @request POST:/users/signin
     */
    signinCreate: (
      credentials: SerializerUserJSON,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/signin`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет токен текущего пользователя из хранилища. Возвращает {"status":"signed_out"}.
     *
     * @tags users
     * @name SignoutCreate
     * @summary Выход (удаление токена)
     * @request POST:/users/signout
     * @secure
     */
    signoutCreate: (username: string, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/signout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Регистрирует нового пользователя. Возвращает URL созданного ресурса в Location и тело созданного пользователя.
     *
     * @tags users
     * @name SignupCreate
     * @summary Регистрация пользователя
     * @request POST:/users/signup
     */
    signupCreate: (user: SerializerUserJSON, params: RequestParams = {}) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/signup`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные профиля (доступен только тот, чей UUID совпадает с user_id в токене).
     *
     * @tags users
     * @name InfoList
     * @summary Получить профиль пользователя
     * @request GET:/users/{login}/info
     * @secure
     */
    infoList: (login: string, params: RequestParams = {}) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/${login}/info`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет профиль пользователя (может делать только сам пользователь).
     *
     * @tags users
     * @name InfoUpdate
     * @summary Изменить профиль пользователя
     * @request PUT:/users/{login}/info
     * @secure
     */
    infoUpdate: (
      login: string,
      user: SerializerUserJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/${login}/info`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
