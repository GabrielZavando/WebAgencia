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

export type ContactDto = object;

export type SubscribeDto = object;

export type UpdateSystemConfigDto = object;

export type CreatePostDto = object;

export type UpdatePostDto = object;

export type CreateUserDto = object;

export type UpdateUserDto = object;

export type CreateReportDto = object;

export type CreateTicketDto = object;

export type UpdateTicketDto = object;

export type AddMessageDto = object;

export type UploadFileDto = object;

export type CreateProjectDto = object;

export type UpdateProjectDto = object;

export type CreateCategoryDto = object;

export type UpdateCategoryDto = object;

export type CreateIdeaDto = object;

export type CrearDiagnosticoDto = object;

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
 * @title WebAstro API
 * @version 1.0
 * @contact
 *
 * API para la Agencia Digital WebAstro
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags App
   * @name AppControllerGetHello
   * @request GET:/
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/`,
      method: "GET",
      ...params,
    });

  health = {
    /**
     * No description
     *
     * @tags App
     * @name AppControllerHealthCheck
     * @request GET:/health
     */
    appControllerHealthCheck: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/health`,
        method: "GET",
        ...params,
      }),
  };
  forms = {
    /**
     * No description
     *
     * @tags Forms
     * @name FormsControllerHandleContact
     * @request POST:/forms/contact
     */
    formsControllerHandleContact: (
      data: ContactDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/forms/contact`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Forms
     * @name FormsControllerHandleSubscribe
     * @request POST:/forms/subscribe
     */
    formsControllerHandleSubscribe: (
      data: SubscribeDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/forms/subscribe`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Forms
     * @name FormsControllerVerifySubscription
     * @request GET:/forms/verify-subscription/{token}
     */
    formsControllerVerifySubscription: (
      token: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/forms/verify-subscription/${token}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Forms
     * @name FormsControllerHandleUnsubscribe
     * @request POST:/forms/unsubscribe
     */
    formsControllerHandleUnsubscribe: (
      query: {
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/forms/unsubscribe`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Forms
     * @name FormsControllerTestMail
     * @request GET:/forms/test-mail
     */
    formsControllerTestMail: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/forms/test-mail`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Forms
     * @name FormsControllerGetStatus
     * @request GET:/forms/status
     */
    formsControllerGetStatus: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/forms/status`,
        method: "GET",
        ...params,
      }),
  };
  systemConfig = {
    /**
     * No description
     *
     * @tags SystemConfig
     * @name SystemConfigControllerGetConfig
     * @request GET:/system-config
     */
    systemConfigControllerGetConfig: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/system-config`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags SystemConfig
     * @name SystemConfigControllerUpdateConfig
     * @request PATCH:/system-config
     */
    systemConfigControllerUpdateConfig: (
      data: UpdateSystemConfigDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/system-config`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  blog = {
    /**
     * No description
     *
     * @tags Blog
     * @name BlogControllerCreate
     * @request POST:/blog
     */
    blogControllerCreate: (data: CreatePostDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Blog
     * @name BlogControllerFindAll
     * @request GET:/blog
     */
    blogControllerFindAll: (
      query: {
        published: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/blog`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Blog
     * @name BlogControllerFindOne
     * @request GET:/blog/{id}
     */
    blogControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Blog
     * @name BlogControllerUpdate
     * @request PATCH:/blog/{id}
     */
    blogControllerUpdate: (
      id: string,
      data: UpdatePostDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/blog/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Blog
     * @name BlogControllerRemove
     * @request DELETE:/blog/{id}
     */
    blogControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Blog
     * @name BlogControllerFindBySlug
     * @request GET:/blog/slug/{slug}
     */
    blogControllerFindBySlug: (slug: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog/slug/${slug}`,
        method: "GET",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindAll
     * @request GET:/users
     */
    usersControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerRegister
     * @request POST:/users/register
     */
    usersControllerRegister: (
      data: CreateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/users/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetProfile
     * @request GET:/users/profile
     */
    usersControllerGetProfile: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/profile`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdateProfile
     * @request PATCH:/users/profile
     */
    usersControllerUpdateProfile: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/profile`,
        method: "PATCH",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerFindOne
     * @request GET:/users/{id}
     */
    usersControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdate
     * @request PATCH:/users/{id}
     */
    usersControllerUpdate: (
      id: string,
      data: UpdateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/users/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerRemove
     * @request DELETE:/users/{id}
     */
    usersControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  clients = {
    /**
     * No description
     *
     * @tags Clients
     * @name ClientsControllerFindAll
     * @request GET:/clients
     */
    clientsControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/clients`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Clients
     * @name ClientsControllerFindAssignable
     * @request GET:/clients/assignable
     */
    clientsControllerFindAssignable: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/clients/assignable`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Clients
     * @name ClientsControllerFindOne
     * @request GET:/clients/{id}
     */
    clientsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/clients/${id}`,
        method: "GET",
        ...params,
      }),
  };
  reports = {
    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerUploadReport
     * @request POST:/reports
     */
    reportsControllerUploadReport: (
      data: CreateReportDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/reports`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerFindAll
     * @request GET:/reports
     */
    reportsControllerFindAll: (
      query: {
        clientId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/reports`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerGetDownloadUrl
     * @request GET:/reports/{id}/download
     */
    reportsControllerGetDownloadUrl: (
      id: string,
      query: {
        download: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/reports/${id}/download`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Reports
     * @name ReportsControllerDeleteReport
     * @request DELETE:/reports/{id}
     */
    reportsControllerDeleteReport: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/reports/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  notifications = {
    /**
     * No description
     *
     * @tags Notifications
     * @name NotificationsControllerGetUserNotifications
     * @request GET:/notifications
     */
    notificationsControllerGetUserNotifications: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/notifications`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notifications
     * @name NotificationsControllerMarkAsRead
     * @request PATCH:/notifications/{id}/read
     */
    notificationsControllerMarkAsRead: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/notifications/${id}/read`,
        method: "PATCH",
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerCreateSession
     * @request POST:/auth/session
     */
    authControllerCreateSession: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/session`,
        method: "POST",
        ...params,
      }),
  };
  support = {
    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerCreateTicket
     * @request POST:/support/tickets
     */
    supportControllerCreateTicket: (
      data: CreateTicketDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/support/tickets`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerFindAll
     * @request GET:/support/tickets
     */
    supportControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support/tickets`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerGetQuota
     * @request GET:/support/tickets/quota/{projectId}
     */
    supportControllerGetQuota: (
      projectId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/support/tickets/quota/${projectId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerGetMyTickets
     * @request GET:/support/tickets/my
     */
    supportControllerGetMyTickets: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support/tickets/my`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerGetClientTickets
     * @request GET:/support/tickets/client/{clientId}
     */
    supportControllerGetClientTickets: (
      clientId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/support/tickets/client/${clientId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerGetTicketById
     * @request GET:/support/tickets/{id}
     */
    supportControllerGetTicketById: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support/tickets/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerUpdateTicket
     * @request PATCH:/support/tickets/{id}
     */
    supportControllerUpdateTicket: (
      id: string,
      data: UpdateTicketDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/support/tickets/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerDeleteTicket
     * @request DELETE:/support/tickets/{id}
     */
    supportControllerDeleteTicket: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support/tickets/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerGetMessages
     * @request GET:/support/tickets/{id}/messages
     */
    supportControllerGetMessages: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support/tickets/${id}/messages`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Support
     * @name SupportControllerAddMessage
     * @request POST:/support/tickets/{id}/messages
     */
    supportControllerAddMessage: (
      id: string,
      data: AddMessageDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/support/tickets/${id}/messages`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  files = {
    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerUpload
     * @request POST:/files
     */
    filesControllerUpload: (data: UploadFileDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/files`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerFindAll
     * @request GET:/files
     */
    filesControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/files`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerGetQuota
     * @request GET:/files/storage/quota
     */
    filesControllerGetQuota: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/files/storage/quota`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerGetUserQuota
     * @request GET:/files/storage/quota/{uid}
     */
    filesControllerGetUserQuota: (uid: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/files/storage/quota/${uid}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerDownload
     * @request GET:/files/{id}/download
     */
    filesControllerDownload: (
      id: string,
      query: {
        download: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/files/${id}/download`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Files
     * @name FilesControllerRemove
     * @request DELETE:/files/{id}
     */
    filesControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/files/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  projects = {
    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerCreate
     * @request POST:/projects
     */
    projectsControllerCreate: (
      data: CreateProjectDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerFindAll
     * @request GET:/projects
     */
    projectsControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerFindMyProjects
     * @request GET:/projects/my
     */
    projectsControllerFindMyProjects: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/my`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerFindAllByClient
     * @request GET:/projects/client/{clientId}
     */
    projectsControllerFindAllByClient: (
      clientId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects/client/${clientId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerFindOne
     * @request GET:/projects/{id}
     */
    projectsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerUpdate
     * @request PATCH:/projects/{id}
     */
    projectsControllerUpdate: (
      id: string,
      data: UpdateProjectDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Projects
     * @name ProjectsControllerRemove
     * @request DELETE:/projects/{id}
     */
    projectsControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  blogCategories = {
    /**
     * No description
     *
     * @tags BlogCategories
     * @name BlogCategoriesControllerCreate
     * @request POST:/blog-categories
     */
    blogCategoriesControllerCreate: (
      data: CreateCategoryDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/blog-categories`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BlogCategories
     * @name BlogCategoriesControllerFindAll
     * @request GET:/blog-categories
     */
    blogCategoriesControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog-categories`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BlogCategories
     * @name BlogCategoriesControllerFindOne
     * @request GET:/blog-categories/{id}
     */
    blogCategoriesControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog-categories/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BlogCategories
     * @name BlogCategoriesControllerUpdate
     * @request PATCH:/blog-categories/{id}
     */
    blogCategoriesControllerUpdate: (
      id: string,
      data: UpdateCategoryDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/blog-categories/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BlogCategories
     * @name BlogCategoriesControllerRemove
     * @request DELETE:/blog-categories/{id}
     */
    blogCategoriesControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/blog-categories/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  ideas = {
    /**
     * No description
     *
     * @tags Ideas
     * @name IdeasControllerCreateIdea
     * @request POST:/ideas
     */
    ideasControllerCreateIdea: (
      data: CreateIdeaDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/ideas`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Ideas
     * @name IdeasControllerFindAll
     * @request GET:/ideas
     */
    ideasControllerFindAll: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/ideas`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Ideas
     * @name IdeasControllerFindMyIdeas
     * @request GET:/ideas/my-ideas
     */
    ideasControllerFindMyIdeas: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/ideas/my-ideas`,
        method: "GET",
        ...params,
      }),
  };
  diagnostico = {
    /**
     * No description
     *
     * @tags Diagnostico
     * @name DiagnosticoControllerCreate
     * @request POST:/diagnostico
     */
    diagnosticoControllerCreate: (
      data: CrearDiagnosticoDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/diagnostico`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Diagnostico
     * @name DiagnosticoControllerProcessQueue
     * @request POST:/diagnostico/process-queue
     */
    diagnosticoControllerProcessQueue: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/diagnostico/process-queue`,
        method: "POST",
        ...params,
      }),
  };
}
