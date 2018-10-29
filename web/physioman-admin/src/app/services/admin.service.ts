import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private login_url = 'api/admin/login';
  private physio_create_url = 'api/physios/new-account';
  private consultant_create_url = 'api/consultants/new-consultant';
  private incidents_url = 'api/incidents?status=';
  private requests_url = 'api/bookings/requests/';
  private patient_name_url = 'api/patients/name?patient_id=';
  private consultant_list_url = 'api/consultants';
  private physio_list_url = 'api/physios';
  private add_equipment_url = 'api/products/add-new';
  private edit_equipment_url = 'api/products/update/';
  private list_equipment_url = 'api/products';
  private equipment_details_url = 'api/products/details/';
  private delete_equipment_url = 'api/products/remove/';
  private update_inventory_url = 'api/products/add-to-inventory/';

  constructor(private http: HttpClient) { }

  private setHeader(token) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }

  // bug
  private setMultipartHeader(token) {
    return new HttpHeaders({
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + token
    });
  }


  login(admin_id, password) {
    return this.http.post(this.login_url, {admin_id, password});
  }

  createPhysio(physio_id, password, physio_name, physio_email, physio_phone, physio_gender,
    physio_dob, date_joined, isConsultant) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(this.physio_create_url, {physio_id, password, physio_name, physio_email,
           physio_phone, physio_gender, physio_dob, date_joined, isConsultant}, {headers: this.setHeader(token)});
  }

  createConsultant(consultant_id, password, consultant_name, consultant_email, consultant_phone, consultant_gender,
    date_joined) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    console.log(consultant_name);
    return this.http.post(this.consultant_create_url, {consultant_id, password,
           consultant_name, consultant_email, consultant_phone, consultant_gender, date_joined},
           {headers: this.setHeader(token)});
  }

  getIncidents(incidentStatus) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.incidents_url + incidentStatus, {headers: this.setHeader(token)});
  }

  getBookingRequestData(request_id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.requests_url + request_id, {headers: this.setHeader(token)});
  }

  getCustomerName(id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.patient_name_url + id, {headers: this.setHeader(token)});
  }

  getConsultants() {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.consultant_list_url, {headers: this.setHeader(token)});
  }

  assignConsultant(url, consultant_id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(url, {consultant_id}, {headers: this.setHeader(token)});
  }

  getPhysios() {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.physio_list_url, {headers: this.setHeader(token)});
  }

  assignPhysio(url, physio_id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(url, {physio_id}, {headers: this.setHeader(token)});
  }

  processOrder(url) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(url, {}, {headers: this.setHeader(token)});
  }

  addEquipment(formdata) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    console.log(formdata);
    return this.http.post(this.add_equipment_url, formdata );  // {headers: this.setMultipartHeader(token)}
  }

  editEquipment(formdata, id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.put(this.edit_equipment_url + id, formdata);
  }

  listEquipment() {
    return this.http.get(this.list_equipment_url);
  }

  getEquipmentDetails(id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.equipment_details_url + id, {headers: this.setHeader(token)});
  }

  removeEquipment(id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.delete(this.delete_equipment_url + id, {headers: this.setHeader(token)});
  }

  updateInventory(id, items_for_sale, items_for_rent) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.put(this.update_inventory_url + id, {items_for_sale, items_for_rent}, {headers: this.setHeader(token)});
  }

}
