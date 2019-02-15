import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // private baseUrl = 'https://physioman-api.herokuapp.com/';
  private baseUrl = 'http://localhost:3000/';
  private consulant_login_url = this.baseUrl + 'api/consultants/login';
  private physio_login_url = this.baseUrl + 'api/physios/login';
  private pending_consultations_url = this.baseUrl + 'api/bookings/pending-consultations';
  private patient_info_url = this.baseUrl + 'api/patients/info?patient_id=';
  private assign_sessions_url = this.baseUrl + 'api/bookings/assign-sessions/';
  private consultant_details_url = this.baseUrl + 'api/consultants/details';
  private physio_details_url = this.baseUrl + 'api/physios/details';
  private assigned_bookings_url = this.baseUrl + 'api/bookings/assigned-bookings';
  private session_otp_url = this.baseUrl + 'api/sessions/sendOTP/';
  private session_start_url = this.baseUrl + 'api/sessions/start-session/';
  private session_end_url = this.baseUrl + 'api/sessions/end-session/';
  private money_received_url = this.baseUrl + 'api/services/payments/cash-receipt/';
  private payable_amount_url = this.baseUrl + 'api/services/payments/payable-amount/';
  private booking_payment_cash_url = this.baseUrl + 'api/services/payments/booking-cash-payment/';
  private unlock_sessions_url = this.baseUrl + 'api/bookings/unlock-sessions/';


  constructor(private http: HttpClient) { }

  private setHeader(token) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }


  login(username, password, userType) {
    if (userType === 'consultant') {
      return this.http.post(this.consulant_login_url, {consultant_id: username, password});
    } else {
      return this.http.post(this.physio_login_url, {physio_id: username, password});
    }
  }

  getPendingConsultations(userToken) {
    return this.http.get(this.pending_consultations_url, {headers: this.setHeader(userToken)});
  }

  getAssignedBookings(userToken) {
    return this.http.get(this.assigned_bookings_url, {headers: this.setHeader(userToken)});
  }

  getPatientInfo(id, userToken) {
    return this.http.get(this.patient_info_url + id, {headers: this.setHeader(userToken)});
  }

  assignSessions(request_id, consultant_otp, allotted_sessions, number_of_sessions_paid_for, amount_paid, userToken) {
    return this.http.post(this.assign_sessions_url + request_id,
      {consultant_otp, allotted_sessions, number_of_sessions_paid_for, amount_paid}, {headers: this.setHeader(userToken)});
  }


  unlockSessions(booking_id, number_of_sessions_paid_for, userToken) {
    return this.http.post(this.unlock_sessions_url + booking_id, {number_of_sessions_paid_for}, {headers: this.setHeader(userToken)});
  }

  collectCash(patient_id, amount, userToken) {
    return this.http.post(this.money_received_url + patient_id, {amount}, {headers: this.setHeader(userToken)});
  }


  sendSessionOTP(userToken, booking_id) {
    return this.http.post(this.session_otp_url + booking_id, {}, {headers: this.setHeader(userToken)});
  }

  startSession(booking_id, otp, userToken) {
    return this.http.post(this.session_start_url + booking_id, {otp}, {headers: this.setHeader(userToken)});
  }

  endSession(session_id, userToken) {
    return this.http.post(this.session_end_url + session_id, {}, {headers: this.setHeader(userToken)});
  }

  getPayableAmount(patient_id, userToken) {
    return this.http.get(this.payable_amount_url + patient_id, {headers: this.setHeader(userToken)});
  }


  booking_cash_payment(booking_id, userToken) {
    return this.http.post(this.booking_payment_cash_url + booking_id, {}, {headers: this.setHeader(userToken)});
  }




  checkForOtherAccount(loggedInAs, userToken) {
    if (loggedInAs === 'consultant') {
      return this.http.get(this.consultant_details_url, {headers: this.setHeader(userToken)}).toPromise()
      .then(details => {
        const consultant = (details as any).consultant;
        if (consultant.isPhysio) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      return this.http.get(this.physio_details_url, {headers: this.setHeader(userToken)}).toPromise()
      .then(details => {
        const physio = (details as any).physio;
        if (physio.isConsultant) {
          return true;
        } else {
          return false;
        }
      });
    }
  }

}
