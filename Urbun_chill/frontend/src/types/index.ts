export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface HeatMapDataPoint {
  lat: number;
  lng: number;
  temperature: number;
}
