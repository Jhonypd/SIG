export enum ReturnType {
  SUCCESS = 1,
  BUSINESS_ERROR = 2,
  VALIDATION_ERROR = 3,
  AUTH_ERROR = 4,
  INTERNAL_ERROR = 5,
}

export interface StandardResponse<T = any> {
  Result: T | null;
  Success: boolean;
  Message: string | null;
  Detail: string | null;
  ReturnCode: number;
  ReturnType: ReturnType;
  ResponseTime: number;
}
