import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { Incident } from '../../models/incident';
import { BookingRequest } from '../../models/bookingRequest';
import { Consultant } from '../../models/consultant';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css']
})
export class IncidentsComponent implements OnInit {

  private booking = new BookingRequest();
  private incidents = new Array<Incident>();
  private incident = new Incident();
  private consultants = new Array();
  private physios = new Array();
  private incidentStatus;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.incidentStatus = 'new';
    this.loadIncidents();
  }

  loadIncidents() {
    this.adminService.getIncidents(this.incidentStatus)
    .subscribe(
      response => {
        this.onLoadIncidents(response);
      },
      error => console.log(error)
    );
  }

  reloadIncidents() {
    this.incidentStatus = 'new';
    this.loadIncidents();
  }

  onLoadIncidents(response) {
    this.incidents = (response as any).incidents;
    this.incidents.map(incident => {
      this.adminService.getCustomerName(incident.customer)
      .subscribe(
        response2 => incident.customer_name = (response2 as any).patient_name,
        error => console.log(error)
      );
    });
  }

  onOpenIncident(incident, id) {
    this.incident = incident;
    // TODO: if incident status is intermediate, view incident details
    if (incident.incident_title === 'Booking Request') {
      const request_id = incident.action_route.split('/').pop();
      this.adminService.getBookingRequestData(request_id)
      .subscribe(response => {
        this.booking.populate(response);
        $(document).ready(() => {
          // @ts-ignore
          $('#assignConsultant').modal('show');
        });
      },
      error => console.log(error)
      );
      this.adminService.getConsultants()
      .subscribe(response => this.consultants = (response as any).consultants, error => console.log(error));
    }
    // tslint:disable-next-line:one-line
    else if (incident.incident_title === 'Equipment Order') {
      this.adminService.processOrder(incident.action_route)
      .subscribe(response => {
        console.log(response);
        this.reloadIncidents();
      },
      error => console.log(error));
    }
    // tslint:disable-next-line:one-line
    else if (incident.incident_title === 'Request Ready for Booking') {
      const request_id = incident.action_route.split('/').pop();
      this.adminService.getBookingRequestData(request_id)
      .subscribe(response => {
        this.booking.populate(response);
        $(document).ready(() => {
          // @ts-ignore
          $('#assignPhysio').modal('show');
        });
      },
      error => console.log(error));
      this.adminService.getPhysios()
      .subscribe(response => this.physios = (response as any).physios, error => console.log(error));
    }
  }

  // handleIntermediateIncident (incident, id) {
  //   //
  // }

  onAssignConsultant(incident, frm) {
    this.adminService.assignConsultant(incident.action_route, frm.value.assigned_consultant)
    .subscribe(response => {
      console.log(response);
      $(document).ready(() => {
        // @ts-ignore
        $('#assignConsultant').modal('hide');
      });
      this.reloadIncidents();
    }, error => console.log(error));
  }

  onAssignPhysio(incident, frm) {
    this.adminService.assignPhysio(incident.action_route, frm.value.assigned_physio)
    .subscribe(response => {
      console.log(response);
      $(document).ready(() => {
        // @ts-ignore
        $('#assignPhysio').modal('hide');
      });
      this.reloadIncidents();
    }, error => console.log(error));
  }

}
