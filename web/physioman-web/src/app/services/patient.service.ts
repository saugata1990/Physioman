import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private baseUrl = 'https://physioman.herokuapp.com/';
  // private baseUrl = 'http://localhost:3000/';

  private signup_url = this.baseUrl + 'api/patients/signup';
  private login_url = this.baseUrl + 'api/patients/login';
  private edit_url = this.baseUrl + 'api/patients/edit-profile';
  private my_profile_url = this.baseUrl + 'api/patients/viewProfile';
  private verification_link_url = this.baseUrl + 'api/patients/email-verification';
  private consultant_name_url = this.baseUrl + 'api/consultants/name/';
  private physio_name_url = this.baseUrl + 'api/physios/name/';
  private booking_request_url = this.baseUrl + 'api/services/new-booking-request';
  private payumoney_hash_url = this.baseUrl + 'api/services/payments/payumoney-hash';
  private payumoney_response_url = this.baseUrl + 'api/services/payments/payumoney-response';
  private payu_auth_url = this.baseUrl + 'api/services/payments/payumoney-auth';
  private search_eqp_url = this.baseUrl + 'api/products/search?q=';
  private list_eqp_url = this.baseUrl + 'api/products';
  private booking_status_url = this.baseUrl + 'api/bookings/status';
  private session_otp_url = this.baseUrl + 'api/sessions/otp';
  private order_url = this.baseUrl + 'api/services/place-order';
  private order_status_url = this.baseUrl + 'api/orders/open';
  private eqp_details_url = this.baseUrl + 'api/products/details/';
  private send_otp_url = this.baseUrl + 'api/patients/send-verification-code/';
  private verify_otp_url = this.baseUrl + 'api/patients/verify-otp/';
  private wallet_balance_url = this.baseUrl + 'api/services/payments/check-wallet-balance?amount=';
  private wallet_pay_url = this.baseUrl + 'api/services/payments/wallet-payment';
  private wallet_recharge_url = this.baseUrl + 'api/services/payments/wallet-recharge-success';
  private unlock_sessions_url = this.baseUrl + 'api/bookings/unlock-sessions/';
  private post_query_url = this.baseUrl + 'api/patients/query';
  private update_password_url = this.baseUrl + 'api/patients/update-password';
  private password_reset_url = this.baseUrl + 'api/patients/reset-password';

  constructor(private http: HttpClient, private store: Store<any>) { }

  private setHeader(token) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }

  // to be fetched from env
  // '4rPfEL6w/pPf3nCfEhCc8ogzf7SeOGVngIiGrWaav2g='
  private setPayUHeader() {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.stringify(localStorage.getItem('payumoney-auth'))
    });
  }

  getPayUAuth() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.payu_auth_url, {headers: this.setHeader(token)});
  }

  postQuery(name, phone, query) {
    return this.http.post(this.post_query_url, {name, phone, query});
  }

  signup(patient_phone, password, patient_name, patient_gender, location) {
    console.log('location ', location);
    return this.http.post(this.signup_url,
      {patient_phone, password, patient_name, patient_gender, lat: location.lat, long: location.long});
  }

  login(patient_phone, password) {
    return this.http.post(this.login_url, {patient_phone, password});
  }

  updatePassword(current_password, new_password) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.update_password_url, {current_password, new_password}, {headers: this.setHeader(token)});
  }

  resetPassword(patient_id, patient_name) {
    return this.http.post(this.password_reset_url, {patient_id, patient_name});
  }

  editProfile(patient_email, patient_dob, patient_address) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.edit_url, {patient_email, patient_dob, patient_address},
      {headers: this.setHeader(token)});
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
    return this.http.post(this.payumoney_hash_url, {amount, txnid, productinfo, firstname, email},
      {headers: this.setPayUHeader()});
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

  sendEmailVerificationLink() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.verification_link_url, {}, {headers: this.setHeader(token)});
  }

  getOTP() {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.session_otp_url , {headers: this.setHeader(token)});
  }

  sendOTP(number) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.send_otp_url + number, {});
  }

  verifyOTP(number, otp) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.verify_otp_url + number, {otp});
  }

  checkWalletBalance(amount) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.wallet_balance_url + amount, {headers: this.setHeader(token)});
  }

  payWithWallet(amount) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.wallet_pay_url, {amount}, {headers: this.setHeader(token)});
  }

  walletRecharge(amount) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.wallet_recharge_url, {amount}, {headers: this.setHeader(token)});
  }

  getConsultantName(id) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.consultant_name_url + id, {headers: this.setHeader(token)});
  }

  getPhysioName(id) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.get(this.physio_name_url + id, {headers: this.setHeader(token)});
  }

  unlockSessions(booking_id, number_of_sessions_paid_for) {
    const token = JSON.parse(localStorage.getItem('patientToken'));
    return this.http.post(this.unlock_sessions_url + booking_id, {number_of_sessions_paid_for}, {headers: this.setHeader(token)});
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
