package fr.roadstock.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockTransferRequest(
        @NotNull(message = "La quantité est obligatoire")
        @Positive(message = "La quantité doit être strictement positive")
        Integer quantity,

        @NotNull(message = "Le sens du transfert doit être spécifié")
        Boolean toGigLocation
) {}
