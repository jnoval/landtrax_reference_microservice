export interface CommonResponse<T = unknown> {
  success: boolean;
  message: string;
  error?: Error | string | null;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface CustomMeta {
  totalPages: number;
  page: number;
  total: number;
  limit: number;
}

export interface GetDataByPaging {
  page: number;
  limit: number;
  search?: string;
  sortDirection?: 'ASC' | 'DESC';
  sortByField?: string;
}
