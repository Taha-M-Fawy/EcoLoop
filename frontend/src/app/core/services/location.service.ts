import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { LocationsApiResponse } from '../models/location.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`; 

  private locations$ = this.http.get<LocationsApiResponse>(this.apiUrl).pipe(
    shareReplay(1)
  );

  getLocations(): Observable<LocationsApiResponse> {
    return this.locations$;
  }
}