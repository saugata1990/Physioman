
export class BookingStatus {

    status: string;
    consultation_payment_mode: string;
    booking_payment_mode: string;
    request_timestamp: Date;
    serviced_by: string; // admin id
    serviced_at: Date;
    mapped_consultant: string;
    consultant_otp: string;
    sessions_fixed_by_consultant: number;
    ready_for_booking: boolean;
    closed: boolean;
    cancellation_requested: boolean;
    reason_for_cancellation: string;

    constructor() {}

    populate(param) {
        this.status = param.status;
        if (param.request) {
            this.request_timestamp = param.request.request_timestamp;
            this.consultation_payment_mode = param.request.consultation_payment_mode;
            if (this.status === 'Processed') {
                // this.status += ', Consultation Pending';
                this.serviced_at = param.request.serviced_at;
                this.mapped_consultant = param.request.mapped_consultant;
                this.consultant_otp = param.request.consultant_otp;
                this.sessions_fixed_by_consultant = param.request.sessions_fixed_by_consultant;
            }
        } else if (param.booking) {
            // booking confirmed data... to be completed later
        }

    }
}
