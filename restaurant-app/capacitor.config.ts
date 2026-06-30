import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ynovb-3-smart-cafe.restaurantapp',
  appName: 'restaurant-app',
  webDir: 'www',
  server: {
    hostname: 'ynovb-3-smart-cafe.vercel.app',
    androidScheme: 'https',
  },
};

export default config;