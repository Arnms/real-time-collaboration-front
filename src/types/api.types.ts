export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message: string;
}

export interface ApiError {
    success: boolean;
    error: string;
    message: string;
    statusCode: number;
    details?: string[];
}

export interface PaginationResponse<T = any> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}
