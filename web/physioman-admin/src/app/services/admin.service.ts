import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // private baseUrl = 'https://physioman-api.herokuapp.com/';
  private baseUrl = 'http://localhost:3000/';

  private login_url = this.baseUrl + 'api/admin/login';
  private physio_create_url = this.baseUrl + 'api/physios/new-account';
  private consultant_create_url = this.baseUrl + 'api/consultants/new-consultant';
  private incidents_url = this.baseUrl + 'api/incidents?status=';
  private requests_url = this.baseUrl + 'api/bookings/all/';
  private patient_name_url = this.baseUrl + 'api/patients/name-and-contact?patient_id=';
  private consultant_list_url = this.baseUrl + 'api/consultants';
  private physio_list_url = this.baseUrl + 'api/physios';
  private add_equipment_url = this.baseUrl + 'api/products/add-new';
  private edit_equipment_url = this.baseUrl + 'api/products/update/';
  private list_equipment_url = this.baseUrl + 'api/products';
  private equipment_details_url = this.baseUrl + 'api/products/details/';
  private delete_equipment_url = this.baseUrl + 'api/products/remove/';
  private update_inventory_url = this.baseUrl + 'api/products/add-to-inventory/';
  private offline_sales_url = this.baseUrl + 'api/orders/process-offline-order/';
  private ordered_items_url = this.baseUrl + 'api/orders/ordered-items/';
  private item_name_url = this.baseUrl + 'api/orders/item-name/';

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

  getCustomerNameAndContact(id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.patient_name_url + id, {headers: this.setHeader(token)});
  }

  getConsultants() {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.consultant_list_url, {headers: this.setHeader(token)});
  }

  assignConsultant(url, consultant_id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(this.baseUrl + url, {consultant_id}, {headers: this.setHeader(token)});
  }

  getPhysios() {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.physio_list_url, {headers: this.setHeader(token)});
  }

  assignPhysio(url, physio_id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(this.baseUrl + url, {physio_id}, {headers: this.setHeader(token)});
  }

  processOrder(url) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(this.baseUrl + url, {}, {headers: this.setHeader(token)});
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
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.list_equipment_url, {headers: this.setHeader(token)});
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

  processOfflineOrder(id, units_sold, units_rented, rented_units_returned) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.post(this.offline_sales_url + id, {units_sold, units_rented, rented_units_returned}, {headers: this.setHeader(token)});
  }

  getOrderedItems(order_id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.ordered_items_url + order_id, {headers: this.setHeader(token)});
  }

  getItemName(id) {
    const token = JSON.parse(localStorage.getItem('adminToken'));
    return this.http.get(this.item_name_url + id, {headers: this.setHeader(token)});
  }

}
