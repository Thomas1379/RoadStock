package fr.roadstock.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "La catégorie est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    private Size size;

    @NotNull(message = "Le prix unitaire est obligatoire")
    @Positive(message = "Le prix doit être strictement positif")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    @Builder.Default
    private Integer homeStock = 0;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    @Builder.Default
    private Integer gigStock = 0;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    @Builder.Default
    private Integer alertThreshold = 5;

    public int getTotalStock() {
        return (homeStock != null ? homeStock : 0) + (gigStock != null ? gigStock : 0);
    }

    public boolean isLowStock() {
        return getTotalStock() <= (alertThreshold != null ? alertThreshold : 0);
    }
}