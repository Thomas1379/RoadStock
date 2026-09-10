package fr.roadstock.api.service;

import fr.roadstock.api.entity.Product;
import fr.roadstock.api.entity.ProductCategory;
import fr.roadstock.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Récupère tous les produits du catalogue.
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Récupère un produit par son ID.
     */
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable avec l'id : " + id));
    }

    /**
     * Récupère les produits par catégorie (TEE_SHIRT, CD, VINYLE).
     */
    public List<Product> getProductsByCategory(ProductCategory category) {
        return productRepository.findByCategory(category);
    }

    /**
     * Récupère uniquement les produits disponibles dans la caisse de tournée (gigStock > 0).
     * Utilisé pour alimenter l'écran tactile de Caisse Concert.
     */
    public List<Product> getAvailableGigProducts() {
        return productRepository.findByGigStockGreaterThan(0);
    }

    /**
     * Crée ou met à jour un produit.
     */
    @Transactional
    public Product saveProduct(Product product) {
        // Règle métier : si c'est un CD ou Vinyle, la taille doit être null
        if (product.getCategory() != ProductCategory.TEE_SHIRT) {
            product.setSize(null);
        }
        return productRepository.save(product);
    }

    /**
     * Supprime un produit par son ID.
     */
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Impossible de supprimer : produit introuvable avec l'id : " + id);
        }
        productRepository.deleteById(id);
    }

    /**
     * Règle métier clé : Transfère une quantité de stock de la maison vers la caisse concert (ou inversement).
     *
     * @param productId     L'identifiant du produit
     * @param quantity      Nombre d'unités à déplacer
     * @param toGigLocation true = Maison -> Caisse Concert | false = Caisse Concert -> Maison
     */
    @Transactional
    public Product transferStock(Long productId, int quantity, boolean toGigLocation) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("La quantité transférée doit être supérieure à zéro.");
        }

        Product product = getProductById(productId);

        if (toGigLocation) {
            // Départ en concert : Maison -> Caisse
            if (product.getHomeStock() < quantity) {
                throw new IllegalStateException(
                        String.format("Stock maison insuffisant (%d dispo) pour transférer %d unités.",
                                product.getHomeStock(), quantity)
                );
            }
            product.setHomeStock(product.getHomeStock() - quantity);
            product.setGigStock(product.getGigStock() + quantity);
        } else {
            // Retour de tournée : Caisse -> Maison
            if (product.getGigStock() < quantity) {
                throw new IllegalStateException(
                        String.format("Stock caisse insuffisant (%d dispo) pour réintégrer %d unités.",
                                product.getGigStock(), quantity)
                );
            }
            product.setGigStock(product.getGigStock() - quantity);
            product.setHomeStock(product.getHomeStock() + quantity);
        }

        return productRepository.save(product);
    }
}
