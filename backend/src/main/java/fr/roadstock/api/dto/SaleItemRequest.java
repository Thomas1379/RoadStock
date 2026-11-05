package fr.roadstock.api.dto;

public record SaleItemRequest(
        Long productId,
        Integer quantity
) {
}
