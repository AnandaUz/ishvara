export interface TGraphPoint {
  value: number;
  date: number;
  title?: string;
  comment?: string;
  isDashed?: boolean;
}

export interface GraphSettings {
  color?: string;
  strokeWidth?: number;
  pointRadius?: number;
}

export interface IGraphSeries {
  settings?: GraphSettings;
  points: Map<number, TGraphPoint> | TGraphPoint[];
}

export interface IGraphsConstructorParams {
  title?: string;
}

export interface IGraphsBounds {
  minValue: number;
  maxValue: number;
  minDate: number;
  maxDate: number;
  dayCount: number;
}

