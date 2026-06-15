import type { Trail } from '../types/trail';
import { getAllTrails } from './trails';

export interface TrailStatsSummary {
  totalCount: number;
  totalDistance: number;
  avgElevationGain: number;
  maxElevationGainTrail: {
    name: string;
    value: number;
  } | null;
}

export function calculateTrailStats(trails?: Trail[]): TrailStatsSummary {
  const data = trails ?? getAllTrails();

  if (data.length === 0) {
    return {
      totalCount: 0,
      totalDistance: 0,
      avgElevationGain: 0,
      maxElevationGainTrail: null,
    };
  }

  const totalCount = data.length;
  const totalDistance = data.reduce((sum, t) => sum + t.distance, 0);
  const avgElevationGain = data.reduce((sum, t) => sum + t.elevationGain, 0) / totalCount;

  let maxTrail = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i].elevationGain > maxTrail.elevationGain) {
      maxTrail = data[i];
    }
  }

  return {
    totalCount,
    totalDistance,
    avgElevationGain,
    maxElevationGainTrail: {
      name: maxTrail.name,
      value: maxTrail.elevationGain,
    },
  };
}
