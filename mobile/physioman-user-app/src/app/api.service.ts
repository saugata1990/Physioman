import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  public baseUrl = 'http://localhost:3000/';

  private signup_url = this.baseUrl + 'api/patients/signup';
  private login_url = this.baseUrl + 'api/patients/login';
  private user_activity_url = this.baseUrl + 'api/patients/booking-and-orders';
  private booking_request_url = this.baseUrl + 'api/services/new-booking-request';
  private booking_status_url = this.baseUrl + 'api/bookings/status';
  private order_url = this.baseUrl + 'api/services/place-order';
  private order_status_url = this.baseUrl + 'api/orders/open';
  private my_profile_url = this.baseUrl + 'api/patients/viewProfile';
  private consultant_name_url = this.baseUrl + 'api/consultants/name/';
  private physio_name_url = this.baseUrl + 'api/physios/name/';
  private session_otp_url = this.baseUrl + 'api/sessions/otp';
  private eqp_details_url = this.baseUrl + 'api/products/details/';
  private list_eqp_url = this.baseUrl + 'api/products';
  private search_eqp_url = this.baseUrl + 'api/products/search?q=';
  private payumoney_hash_url = this.baseUrl + 'api/services/payments/payumoney-hash';
  private payumoney_response_url = this.baseUrl + 'api/services/payments/payumoney-response';
  private wallet_pay_url = this.baseUrl + 'api/services/payments/wallet-payment';
  private send_otp_url = this.baseUrl + 'api/patients/send-verification-code/';
  private verify_otp_url = this.baseUrl + 'api/patients/verify-otp/';


  constructor(private http: HttpClient) { }

  private setHeader(token) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }

  login(patient_id, password) {
    return this.http.post(this.login_url, {patient_id, password});
  }

  signup(patient_phone, password, patient_name, patient_gender) {
    return this.http.post(this.signup_url,
      {patient_phone, password, patient_name, patient_gender});
  }

  getUserActivity(token) {
    return this.http.get(this.user_activity_url, {headers: this.setHeader(token)});
  }

  requestBooking(ailment_description, physio_gender_preference, consultation_payment_mode, token) {
    return this.http.post(this.booking_request_url,
                          {ailment_description, physio_gender_preference, consultation_payment_mode},
                          {headers: this.setHeader(token)});
  }

  getBookingStatus(token) {
    return this.http.get(this.booking_status_url, {headers: this.setHeader(token)});
  }

  getOrderStatus(token) {
    return this.http.get(this.order_status_url, {headers: this.setHeader(token)});
  }

  getProfileInfo(token) {
    return this.http.get(this.my_profile_url, {headers: this.setHeader(token)});
  }

  getConsultantName(id, token) {
    return this.http.get(this.consultant_name_url + id, {headers: this.setHeader(token)});
  }

  getPhysioName(id, token) {
    return this.http.get(this.physio_name_url + id, {headers: this.setHeader(token)});
  }

  getOTP(token) {
    return this.http.get(this.session_otp_url , {headers: this.setHeader(token)});
  }

  getEquipmentDetails(id, token) {
    return this.http.get(this.eqp_details_url + id, {headers: this.setHeader(token)});
  }

  searchEquipment(keyword, token) {
    return this.http.get(this.search_eqp_url + keyword, {headers: this.setHeader(token)});
  }

  listEquipment(token) {
    return this.http.get(this.list_eqp_url, {headers: this.setHeader(token)});
  }

  getPayUMoneyHash(amount, txnid, productinfo, firstname, email, token) {
    return this.http.post(this.payumoney_hash_url, {amount, txnid, productinfo, firstname, email},
      {headers: this.setHeader(token)});
  }


  redirectToPayU (pd, bolt, token) {
    return new Promise((resolve, reject) => {
      bolt.launch(pd, {
            responseHandler: (response) => {
              return this.http.post(this.payumoney_response_url, {response: JSON.stringify(response.response)},
                                     {headers: this.setHeader(token)})
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

  placeOrder(items_purchased, items_rented, payment_mode, token) {
    return this.http.post(this.order_url, {items_purchased, items_rented, payment_mode}, {headers: this.setHeader(token)});
  }

  payWithWallet(amount, token) {
    return this.http.post(this.wallet_pay_url, {amount}, {headers: this.setHeader(token)});
  }

  sendOTP(number, token) {
    return this.http.post(this.send_otp_url + number, {}, {headers: this.setHeader(token)});
  }

  verifyOTP(number, otp, token) {
    return this.http.post(this.verify_otp_url + number, {otp}, {headers: this.setHeader(token)});
  }

}
