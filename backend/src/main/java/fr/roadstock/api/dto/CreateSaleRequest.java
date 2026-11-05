package fr.roadstock.api.dto;

import fr.roadstock.api.entity.PaymentMethod;
import java.util.List;

public record CreateSaleRequest(
        PaymentMethod paymentMethod,
        List<SaleItemRequest> items
) {
}
