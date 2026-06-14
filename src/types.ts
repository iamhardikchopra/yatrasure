export interface JourneyOption {
  id: string;
  type: 'cab' | 'auto' | 'bike' | 'cab-metro' | 'auto-metro' | 'bike-metro';
  title: string;
  icons: string[];
  subtitle: string;
  price: number;
  time: number;
  breakdown?: string;
  badge?: string;
  badgeColor?: 'red' | 'orange' | 'teal' | 'gold-mint';
  secondBadge?: string;
  isHero?: boolean;
}

export interface TimelineStep {
  id: number;
  title: string;
  subtitle: string;
  statusText: string;
  completed: boolean;
  active: boolean;
  type: 'pickup' | 'metro' | 'arrival' | 'dropoff';
}

export interface StationHeatmapPoint {
  id: string;
  name: string;
  passengers: number;
  time: string;
  color: 'gold' | 'teal';
  x: number; // percentage from left
  y: number; // percentage from top
  size: number; // diameter in px
}
