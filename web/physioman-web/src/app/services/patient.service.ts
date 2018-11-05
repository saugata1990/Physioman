import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private signup_url = 'api/patients/signup';
  private login_url = 'api/patients/login';
  private my_profile_url = 'api/patients/viewProfile';
  private name_and_email_url = 'api/patients/name-and-email';
  private booking_request_url = 'api/services/new-booking-request';
  private payumoney_hash_url = 'api/services/payments/payumoney-hash';
  private payumoney_response_url = 'api/services/payments/payumoney-response';
  private search_eqp_url = 'api/products/search?q=';
  private list_eqp_url = 'api/products';
  private booking_status_url = 'api/bookings/status';
  private order_url = 'api/services/place-order';
  private order_status_url = 'api/orders/open';
  private eqp_details_url = 'api/products/details/';
  private send_otp_url = 'api/patients/send-verification-code/';
  private verify_otp_url = 'api/patients/verify-otp/';


  constructor(private http: HttpClient, private store: Store<any>) { }

  private setHeader(token) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }

  private setPayUHeader() {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': '4rPfEL6w/pPf3nCfEhCc8ogzf7SeOGVngIiGrWaav2g='
    });
  }

  signup(patient_phone, password, patient_name, patient_email, patient_gender, patient_dob, patient_address, ailment_history) {
    return this.http.post(this.signup_url,
      {patient_phone, password, patient_name, patient_email, patient_gender, patient_dob, patient_address, ailment_history});
  }

  login(patient_id, password) {
    return this.http.post(this.login_url, {patient_id, password});
  }

  viewProfile() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.my_profile_url, {headers: this.setHeader(token)});
  }

  requestBooking(ailment_description, physio_gender_preference, consultation_payment_mode) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.booking_request_url,
                          {ailment_description, physio_gender_preference, consultation_payment_mode},
                          {headers: this.setHeader(token)});
  }

  getPayUMoneyHash(amount, txnid, productinfo, firstname, email) {
    return this.http.post(this.payumoney_hash_url, {amount, txnid, productinfo, firstname, email}, {headers: this.setPayUHeader()});
  }


  redirectToPayU (pd, bolt) {
    return new Promise((resolve, reject) => {
      bolt.launch(pd, {
            responseHandler: (response) => {
              return this.http.post(this.payumoney_response_url, {response: JSON.stringify(response.response)},
                                     {headers: this.setPayUHeader()})
              .subscribe(res => {
                resolve(res);
              }, err => {
                reject(err);
              });
            },
            catchException: (response) => reject(response)
          });
    }).then(res => true).catch(err => {console.log(err); return false; });
  }

  searchEquipment(keyword) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.search_eqp_url + keyword, {headers: this.setHeader(token)});
  }

  listEquipment() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.list_eqp_url, {headers: this.setHeader(token)});

  }

  getBookingStatus() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.booking_status_url, {headers: this.setHeader(token)});
  }

  getOrderStatus() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.order_status_url, {headers: this.setHeader(token)});
  }

  placeOrder(items_purchased, items_rented, payment_mode) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.order_url, {items_purchased, items_rented, payment_mode}, {headers: this.setHeader(token)});
  }

  getEquipmentDetails(id) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.eqp_details_url + id, {headers: this.setHeader(token)});
  }

  sendOTP(number) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.send_otp_url + number, {});
  }

  verifyOTP(number, otp) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.verify_otp_url + number, {otp});
  }

  getState() {
    return this.store.select('appReducer');
  }

  updateState(obj) {
    this.store.dispatch({
      type: obj.action,
      payload: obj.payload
    });
  }



}
