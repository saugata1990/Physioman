export class BookingRequest {
    request_id: string;
    ailment_description: string;
    physio_gender_preference: string;

    constructor() {}

    populate(param) {
        const booking = param.request;
        this.request_id = booking._id;
        this.ailment_description = booking.ailment_description;
        this.physio_gender_preference = booking.physio_gender_preference;
    }
}
