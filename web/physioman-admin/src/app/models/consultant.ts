export class Consultant {
    consultant_id: string;
    consultant_name: string;
    pending_consultations: Number;

    constructor() {}

    populate(param) {
        const consultant = param.consultant;
        this.consultant_id = consultant.consultant_id;
        this.consultant_name = consultant.consultant_name;
        this.pending_consultations = consultant.pending_consultations;
    }
}


// this model is not needed
