import { Icon } from "@edge/ui";
import { ComponentProps } from "react";

export interface NTCService {
  id?: string;
  category?: string;
  serviceCategoryId?: string;
  title: string;
  description: string;
  requirements: string[];
  fee: string;
  time: string;
}

export interface NTCServiceCategory {
  id: string;
  title: string;
  icon: ComponentProps<typeof Icon>["name"];
  description: string;
  services: NTCService[];
}

export const servicesData: NTCServiceCategory[] = [];
