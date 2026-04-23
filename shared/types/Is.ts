export interface IPixelEventData {
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: string;
  user_data: {
    em?: string;
    ph?: string;
    fbp?: string;
    fbc?: string;
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
  };
}
