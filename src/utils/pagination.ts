import { Request } from "express";

export interface PaginationParams {
  order: any;
  asc: any;
  page: number;
  pageSize: number;
}

export interface PaginationResponse {
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/**
 * Extracts pagination parameters from the request body or query (if needed in future).
 * Defaults: page=1, pageSize=10
 */
export const getPaginationParams = (req: Request): PaginationParams => {
  const { order, asc, page = 1, pageSize = 10 } = req.body;
  return {
    order,
    asc,
    page: Number(page),
    pageSize: Number(pageSize),
  };
};

/**
 * Formats the pagination object from the service response for the API response.
 * Maps `total` to `totalCount` and spreads the rest.
 */
export const formatPaginationResponse = (paginationData: {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}): PaginationResponse => {
  const { total, page, ...rest } = paginationData;
  return {
    totalCount: total,
    page,
    ...rest,
  };
};
