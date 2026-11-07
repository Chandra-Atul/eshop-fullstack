package com.eshop.controller;

import com.eshop.model.*;
import com.eshop.repository.OrderRepository;
import com.eshop.repository.ProductRepository;
import com.eshop.repository.ShopRepository;
import com.eshop.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v2/product")
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CloudinaryService cloudinaryService;

    @PostMapping("/create-product")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> body) throws Exception {
        Long shopId = Long.valueOf(body.get("shopId").toString());
        Optional<Shop> shopOpt = shopRepository.findById(shopId);
        if (shopOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Shop Id is invalid!"));
        }

        List<Avatar> imagesLinks = new ArrayList<>();
        Object imgData = body.get("images");
        List<String> images = (imgData instanceof List) ? (List<String>) imgData : Collections.singletonList(imgData.toString());
        for (String base64 : images) {
            imagesLinks.add(cloudinaryService.uploadImage(base64, "products"));
        }

        Product product = Product.builder()
                .name((String) body.get("name"))
                .description((String) body.get("description"))
                .category((String) body.get("category"))
                .tags((String) body.get("tags"))
                .originalPrice(body.get("originalPrice") != null ? Double.valueOf(body.get("originalPrice").toString()) : null)
                .discountPrice(Double.valueOf(body.get("discountPrice").toString()))
                .stock(Integer.valueOf(body.get("stock").toString()))
                .shopId(shopId)
                .shop(shopOpt.get())
                .images(imagesLinks)
                .build();

        product = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "product", product));
    }

    @GetMapping("/get-all-products")
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(Map.of("success", true, "products", productRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/get-all-products-shop/{id}")
    public ResponseEntity<?> getAllProductsShop(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "products", productRepository.findByShopId(id)));
    }

    @DeleteMapping("/delete-shop-product/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) throws Exception {
        Optional<Product> pOpt = productRepository.findById(id);
        if (pOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product is not found with this id"));
        for (Avatar img : pOpt.get().getImages()) {
            cloudinaryService.deleteImage(img.getPublic_id());
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Product Deleted successfully!"));
    }

    @PutMapping("/create-new-review")
    public ResponseEntity<?> createReview(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Long orderId = Long.valueOf(body.get("orderId").toString());
        Double rating = Double.valueOf(body.get("rating").toString());
        String comment = (String) body.get("comment");

        Optional<Product> pOpt = productRepository.findById(productId);
        if (pOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Product not found"));

        Product product = pOpt.get();
        product.getReviews().removeIf(r -> r.getUserId().equals(user.getId()));
        product.getReviews().add(ProductReview.builder()
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .rating(rating)
                .comment(comment)
                .productId(productId)
                .build());

        double avg = product.getReviews().stream().mapToDouble(ProductReview::getRating).average().orElse(0.0);
        product.setRatings(avg);
        productRepository.save(product);

        orderRepository.findById(orderId).ifPresent(order -> {
            order.getCart().stream().filter(item -> item.getProductId().equals(productId)).forEach(item -> item.setIsReviewed(true));
            orderRepository.save(order);
        });
        return ResponseEntity.ok(Map.of("success", true, "message", "Reviwed succesfully!"));
    }

    @GetMapping("/admin-all-products")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllProductsAdmin() {
        return ResponseEntity.ok(Map.of("success", true, "products", productRepository.findAllByOrderByCreatedAtDesc()));
    }
}
