import { ApiResponse } from "../types";

export interface RegionDto {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface RegionOption {
  label: string;
  value: string;
  code: string;
  id: string;
}

export type { ApiResponse };
