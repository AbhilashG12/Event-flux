export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATED"] = "CREATED";
    OrderStatus["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    OrderStatus["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    OrderStatus["INVENTORY_RESERVED"] = "INVENTORY_RESERVED";
    OrderStatus["COMPLETED"] = "COMPLETED";
})(OrderStatus || (OrderStatus = {}));
