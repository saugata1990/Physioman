export class Order {
    items_purchased: Array<string>;
    items_rented: Array<string>;
    items_in_detail: Array<any>;
    order_timestamp: string;
    ordered_items: Array<string> = [];
    payment_mode: string;
    processed: string;
    closed: boolean;

    populate(param) {
        const order = param.order;
        this.items_purchased = order.items_purchased;
        this.items_rented = order.items_rented;
        this.order_timestamp = order.order_timestamp;
        this.ordered_items = order.ordered_items;
        this.payment_mode = order.payment_mode;
        this.processed = order.processed;
        this.closed = order.closed;
        this.items_in_detail = [];
    }

}
