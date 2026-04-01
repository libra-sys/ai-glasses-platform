import { useEffect } from 'react';

/**
 * SpeedInsights component for Vercel Speed Insights integration
 * This component injects the Speed Insights tracking script into the application
 * enabling performance monitoring and metrics collection.
 */
export function SpeedInsights() {
  useEffect(() => {
    // Import the injectSpeedInsights function from the package
    // This will only run once on the client side when the component mounts
    import('@vercel/speed-insights').then(({ injectSpeedInsights }) => {
      injectSpeedInsights();
    });
  }, []);

  return null;
}

export default SpeedInsights;
