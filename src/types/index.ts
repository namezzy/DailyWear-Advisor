export interface UserPreferences {
  gender?: "male" | "female" | "other";
  coldSensitivity?: "low" | "medium" | "high";
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  uvIndexMax: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
  description: string;
}

export interface AIAdvice {
  clothing: string;
  encouragement: string;
}

export interface DashboardData {
  weather: WeatherData;
  advice: AIAdvice;
  oneDaily: {
    quote: string;
    author: string;
    imgUrl: string;
    volume: string;
  };
  city: string;
  date: string;
}
