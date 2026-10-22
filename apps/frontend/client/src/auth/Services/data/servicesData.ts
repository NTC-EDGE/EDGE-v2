import { Icon } from "@edge/ui";
import { ComponentProps } from "react";

export interface NTCService {
  id?: string;
  code?: string;
  name?: string;
  formNo?: string;
  category?: string;
  categoryCode?: string;
  serviceCategoryCode?: string;
  serviceCategoryId?: string;
  serviceCategory?: { id?: string; name?: string; code?: string; type?: string | number };
  title: string;
  description: string;
  whoMayAvail?: string;
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
