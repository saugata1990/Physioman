import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { Incident } from '../../models/incident';
import { BookingRequest } from '../../models/bookingRequest';
import { Consultant } from '../../models/consultant';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css']
})
export class IncidentsComponent implements OnInit {

  booking;
  incidents = new Array();
  incident;
  consultants = new Array();
  physios = new Array();
  incidentStatus;
  amount;
  personnel_id;
  cash_collected = false;
  incidentsLoaded = false;
  // private incidentOpened = false;

  constructor(private adminService: AdminService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
    // this.toastr.infoToastr('Toaster works');
    this.incidentStatus = 'new';
    this.loadIncidents();
  }

  loadIncidents() {
    // this.incidentOpened = false;
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
      this.adminService.getCustomerNameAndContact(incident.customer)
      .subscribe(
        response2 => {
          incident.customer_name = (response2 as any).patient_name;
          incident.customer_contact = (response2 as any).patient_phone;
          if (incident.incident_title === 'Equipment Order') {
            this.getOrderedItems(incident);
          }
          this.incidentsLoaded = true;
        },
        error => console.log(error)
      );
    });
  }

  onOpenIncident(incident, id) {
    this.incident = incident;
    // TODO: if incident status is intermediate, view incident details
    if (this.incidentStatus === 'intermediate') {
      this.handleIntermediateIncident(incident, id);
    } else if (this.incidentStatus === 'processed') {
      console.log('already processed');
    } else {
      if (incident.incident_title === 'Booking Request') {
        const request_id = incident.action_route.split('/').pop();
        this.adminService.getBookingRequestData(request_id)
        .subscribe(response => {
          this.booking = (response as any).request;
          // this.incidentOpened = true;
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
          this.toastr.successToastr('Order has been processed');
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
          this.booking = (response as any).booking;
          $(document).ready(() => {
            // @ts-ignore
            $('#assignPhysio').modal('show');
          });
        },
        error => console.log(error));
        this.adminService.getPhysios()
        .subscribe(response => this.physios = (response as any).physios, error => console.log(error));
      }
      // tslint:disable-next-line:one-line
      else if (incident.incident_title === 'Collect Cash from personnel') {
        this.personnel_id = incident.action_route.split('/').pop();
        this.adminService.getCollectionAmount(this.personnel_id)
        .subscribe(response => {
          this.amount = (response as any).amount;
          $(document).ready(() => {
            // @ts-ignore
            $('#cashCollection').modal('show');
          });
        });
      }
    }
  }


  onCashCollected() {
    $(document).ready(() => {
      // @ts-ignore
      $('#cashCollection').modal('hide');
      this.adminService.collectCash(this.personnel_id)
      .subscribe(response => {
        console.log(response);
        this.loadIncidents();
        this.toastr.successToastr((response as any).message);
      });
    });
  }


  handleIntermediateIncident (incident, id) {
    // to be written
  }

  onAssignConsultant(incident, frm) {
    this.adminService.assignConsultant(incident.action_route, frm.value.assigned_consultant)
    .subscribe(response => {
      console.log(response);
      this.toastr.successToastr((response as any).message);
      // this.incidentOpened = false;
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
      this.toastr.successToastr((response as any).message);
      // this.incidentOpened = false;
      $(document).ready(() => {
        // @ts-ignore
        $('#assignPhysio').modal('hide');
      });
      this.reloadIncidents();
    }, error => console.log(error));
  }

  getOrderedItems(incident) {
    const order_id = incident.action_route.split('/').pop();
    this.adminService.getOrderedItems(order_id)
    .subscribe(response => {
      incident.ordered_items_ids = (response as any).ordered_items;
      incident.ordered_items = new Array();
      incident.ordered_items_ids.map(item_id => {
        this.adminService.getItemName(item_id)
        .subscribe(response2 => {
          incident.ordered_items.push((response2 as any).product_name);
        });
      });
    });
  }

}
