export interface NTCService {
    title: string;
    description: string;
    requirements: string[];
    fee: string;
    time: string;
}
export interface NTCServiceCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    services: NTCService[];
}
export declare const servicesData: NTCServiceCategory[];
