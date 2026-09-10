package fr.roadstock.api.repository;

import fr.roadstock.api.entity.Product;
import fr.roadstock.api.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(ProductCategory category);

    List<Product> findByGigStockGreaterThan(int minStock);
}
