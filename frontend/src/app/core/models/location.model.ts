export interface LocationItem {
  _id?: string;
  governorate: string;
  cities: string[];
}

export interface LocationsApiResponse {
  success: boolean;
  data: LocationItem[];
}