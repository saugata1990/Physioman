export class Incident {
    customer_name: string;
    incident_id: string;
    action_route: string;
    customer: string;
    priority: number;
    status: string;
    timestamp: Date;
    incident_title: string;
    ordered_items_ids: [string];
    ordered_items: [string];

    constructor() {  }

    populate(param) {
        const incident = param.incident;
        this.incident_id = incident._id;
        this.action_route = incident.action_route;
        this.customer = incident.customer;
        this.priority = incident.priority;
        this.status = incident.status; // new, awaiting_confirmation, completed
        this.timestamp = incident.timestamp;
        this.incident_title = incident.incident_title;
    }
}
