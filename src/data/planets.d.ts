/**
 * Type declarations for `./planets.js` (CI runs `tsc -b` on all files under `src`).
 */

export interface Planet {
  id: string;
  name: string;
  type: string;
  temperature?: number | null;
  waterCoverage?: number | null;
  atmosphere?: string | null;
  atmosphereThickness?: string | null;
  mass?: number | null;
  weather?: string | null;
  ozoneLayer?: boolean;
  ozonLayer?: boolean;
  description?: string;
  bestAnswer?: boolean;
  size?: string;
}

export interface Level {
  id: number;
  name: string;
  star: {
    name: string;
    type: string;
    description: string;
  };
  planets: Planet[];
}

export declare const levels: readonly Level[];
