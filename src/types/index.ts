export interface WheelSegment {
  id: string;
  text: string;
  color: string;
}

export interface SpinResult {
  id: string;
  timestamp: number;
  winner: WheelSegment;
} 