export class Patient {
    id: string;
    name: string;
    phone: string;
    email: string;
    gender: string;
    dob: Date;
    address: string;
    ailment: string;

    constructor() {
    }

    populate(param) {
        const patient = param.patient;
        this.id = patient.patient_id;
        this.name = patient.patient_name;
        this.phone = patient.patient_phone;
        this.email = patient.patient_email;
        this.gender = patient.patient_gender;
        this.dob = patient.patient_dob;
        this.address = patient.patient_address;
        this.ailment = patient.ailment_history;
    }
}
