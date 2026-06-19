/**
 * Chart Dimensions Configuration
 * Defines standard dimensions for various chart types
 */

export const CHART_DIMENSIONS = {
  BAR_CHART: {
    HEIGHT: 150,
    BAR_WIDTH: 16,
    GAP: 12
  },
  RADAR_CHART: {
    CENTER_X: 200,
    CENTER_Y: 175,
    RADIUS: 120,
    LABEL_RADIUS: 140
  },
  GAUGE: {
    STROKE_RADIUS: 50,
    SIZE: 120,
    CIRCUMFERENCE: 2 * Math.PI * 50
  },
  FREQUENCY_CHART: {
    HEIGHT: 150,
    BAR_WIDTH: 16,
    GAP: 12,
    INFLUENCE_HEIGHT_MULTIPLIER: 0.35
  }
} as const;
