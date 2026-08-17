export interface ApiResponse<T> {
    message: string | null;
    length : number;
    data: T;
}