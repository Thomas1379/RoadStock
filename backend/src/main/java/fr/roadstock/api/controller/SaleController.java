package fr.roadstock.api.controller;

import fr.roadstock.api.dto.CreateSaleRequest;
import fr.roadstock.api.entity.Sale;
import fr.roadstock.api.service.SaleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST dédié à la gestion des ventes (Caisse Concert).
 * Expose les endpoints pour enregistrer un encaissement et consulter l'historique des tickets.
 */
@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:4200")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    /**
     * Récupère l'historique complet des ventes ordonné par date antéchronologique.
     * GET /api/sales
     */
    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        List<Sale> sales = saleService.getAllSales();
        return ResponseEntity.ok(sales);
    }

    /**
     * Enregistre un nouvel encaissement (décrémente le stock caisse et persiste le ticket).
     * POST /api/sales
     *
     * @param request DTO contenant le mode de paiement et les lignes d'articles
     * @return Le ticket de vente créé avec statut HTTP 201 Created
     */
    @PostMapping
    public ResponseEntity<Sale> processSale(@RequestBody CreateSaleRequest request) {
        Sale createdSale = saleService.processSale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSale);
    }
}