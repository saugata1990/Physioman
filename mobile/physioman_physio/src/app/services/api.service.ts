import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private consulant_login_url = 'http://localhost:3000/api/consultants/login';
  private physio_login_url = 'http://localhost:3000/api/physios/login';
  private pending_consultations_url = 'http://localhost:3000/api/bookings/pending-consultations';
  private patient_address_url = 'http://localhost:3000/api/patients/details?patient_id=';
  private assign_sessions_url = 'http://localhost:3000/api/bookings/assign-sessions/';
  private consultant_details_url = 'http://localhost:3000/api/consultants/details';
  private physio_details_url = 'http://localhost:3000/api/physios/details';
  private assigned_bookings_url = 'http://localhost:3000/api/bookings/assigned-bookings';
  private session_otp_url = 'http://localhost:3000/api/sessions/sendOTP/';
  private session_start_url = 'http://localhost:3000/api/sessions/start-session/';
  private session_end_url = 'http://localhost:3000/api/sessions/end-session/';

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

  getPatientAddress(id, userToken) {
    return this.http.get(this.patient_address_url + id, {headers: this.setHeader(userToken)});
  }

  assignSessions(request_id, consultant_otp, sessions_fixed, booking_amount_payable, booking_amount_received, userToken) {
    return this.http.put(this.assign_sessions_url + request_id,
      {consultant_otp, sessions_fixed, booking_amount_payable, booking_amount_received}, {headers: this.setHeader(userToken)});
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
