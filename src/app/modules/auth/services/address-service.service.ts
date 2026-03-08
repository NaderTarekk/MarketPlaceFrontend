import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { CreateAddressDto, UpdateAddressDto } from '../../../models/address';

@Injectable({
  providedIn: 'root',
})
export class AddressServiceService {
 
    constructor(private http: HttpClient) { }

  getAddresses(): Observable<any> {
    return this.http.get<any>(environment.addressUrl);
  }

  getAddressById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.addressUrl}/${id}`);
  }

  createAddress(dto: CreateAddressDto): Observable<any> {
    return this.http.post<any>(environment.addressUrl, dto);
  }

  updateAddress(id: number, dto: UpdateAddressDto): Observable<any> {
    return this.http.put<any>(`${environment.addressUrl}/${id}`, dto);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.addressUrl}/${id}`);
  }

  setDefaultAddress(id: number): Observable<any> {
    return this.http.patch<any>(`${environment.addressUrl}/${id}/set-default`, {});
  }
}
