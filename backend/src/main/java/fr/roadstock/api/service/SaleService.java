package fr.roadstock.api.service;

import fr.roadstock.api.dto.CreateSaleRequest;
import fr.roadstock.api.dto.SaleItemRequest;
import fr.roadstock.api.entity.Product;
import fr.roadstock.api.entity.Sale;
import fr.roadstock.api.entity.SaleItem;
import fr.roadstock.api.repository.ProductRepository;
import fr.roadstock.api.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    /**
     * Récupère la liste complète des tickets de caisse par ordre antéchronologique.
     * Transaction en lecture seule pour optimiser les performances Hibernate.
     */
    @Transactional(readOnly = true)
    public List<Sale> getAllSales() {
        return saleRepository.findAllByOrderBySaleDateDesc();
    }

    /**
     * Traite l'encaissement d'un ticket de vente
     *
     * @param request DTO contenant le mode de paiement et la liste des articles/quantités
     * @return L'entité Sale persistée avec son identifiant et son montant total calculé
     */
    @Transactional
    public Sale processSale(CreateSaleRequest request) {
        // 1. Règle métier : interdiction d'encaisser un panier vide
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Une vente doit contenir au moins un article.");
        }

        // 2. Initialisation du ticket de vente
        Sale sale = new Sale();
        sale.setPaymentMethod(request.paymentMethod());

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        // 3. Traitement ligne par ligne du panier
        for (SaleItemRequest itemReq : request.items()) {
            // Validation de la quantité demandée
            if (itemReq.quantity() == null || itemReq.quantity() <= 0) {
                throw new IllegalArgumentException("La quantité vendue doit être supérieure à zéro.");
            }

            // Vérification de l'existence du produit en base
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Produit introuvable avec l'identifiant : " + itemReq.productId()));

            // Règle de stock critique : contrôle de disponibilité sur le stand
            if (product.getGigStock() < itemReq.quantity()) {
                throw new IllegalStateException(
                        "Stock caisse insuffisant pour « " + product.getName() + " ». Dispo : " + product.getGigStock()
                );
            }

            // Décrémentation du stock caisse
            product.setGigStock(product.getGigStock() - itemReq.quantity());
            productRepository.save(product);

            // Création de la ligne d'encaissement
            // On fige le prix du produit au moment précis de l'achat (évite les dérives si le prix change plus tard)
            BigDecimal unitPrice = product.getPrice();
            SaleItem saleItem = new SaleItem(sale, product, itemReq.quantity(), unitPrice);
            sale.addItem(saleItem);

            // Calcul financier : Sous-total ligne = Prix unitaire x Quantité
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));
            calculatedTotal = calculatedTotal.add(lineTotal);
        }

        // 4. Affectation du montant total certifié côté serveur
        sale.setTotalAmount(calculatedTotal);

        // 5. Sauvegarde de la vente (la cascade enregistre automatiquement les SaleItem)
        return saleRepository.save(sale);
    }
}