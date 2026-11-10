package com.eshop.controller;

import com.eshop.model.*;
import com.eshop.repository.OrderRepository;
import com.eshop.repository.ProductRepository;
import com.eshop.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v2/order")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    @SuppressWarnings("unchecked")
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            List<Map<String, Object>> cartList = (List<Map<String, Object>>) body.get("cart");
            Map<String, Object> userMap = (Map<String, Object>) body.get("user");
            Map<String, Object> shippingMap = (Map<String, Object>) body.get("shippingAddress");
            Map<String, Object> paymentMap = (Map<String, Object>) body.get("paymentInfo");

            if (cartList == null || cartList.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cart cannot be empty"));
            }

            // 1. Build Address safely
            Address shipping = null;
            if (shippingMap != null) {
                Object zipObj = shippingMap.get("zipCode");
                Long zip = 0L;
                if (zipObj != null) {
                    try {
                        zip = Long.valueOf(zipObj.toString().replaceAll("[^0-9]", ""));
                    } catch (Exception ignored) {}
                }

                shipping = Address.builder()
                        .country((String) shippingMap.get("country"))
                        .city((String) shippingMap.get("city"))
                        .address1((String) shippingMap.get("address1"))
                        .address2((String) shippingMap.get("address2"))
                        .zipCode(zip)
                        .addressType(shippingMap.get("addressType") != null ? shippingMap.get("addressType").toString() : "Default")
                        .build();
            }

            // 2. Build PaymentInfo safely
            PaymentInfo paymentInfo = PaymentInfo.builder()
                    .paymentId(paymentMap != null && paymentMap.get("id") != null ? paymentMap.get("id").toString() : "COD-" + UUID.randomUUID().toString().substring(0, 8))
                    .status(paymentMap != null && paymentMap.get("status") != null ? paymentMap.get("status").toString() : "Pending")
                    .type(paymentMap != null && paymentMap.get("type") != null ? paymentMap.get("type").toString() : "Cash On Delivery")
                    .build();

            // 3. Safe User ID resolution
            Long userId = 1L;
            String userName = "Customer";
            String userEmail = "customer@example.com";
            if (userMap != null) {
                Object uidObj = userMap.get("id") != null ? userMap.get("id") : userMap.get("_id");
                if (uidObj != null) {
                    try {
                        userId = Long.valueOf(uidObj.toString());
                    } catch (Exception ignored) {}
                }
                if (userMap.get("name") != null) userName = userMap.get("name").toString();
                if (userMap.get("email") != null) userEmail = userMap.get("email").toString();
            }

            // 4. Group items by shopId
            Map<Long, List<OrderItem>> shopItemsMap = new HashMap<>();
            for (Map<String, Object> item : cartList) {
                Long shopId = extractShopId(item);
                Long prodId = extractProductId(item);

                double price = 0.0;
                Object priceObj = item.get("discountPrice") != null ? item.get("discountPrice") : item.get("price");
                if (priceObj != null) {
                    try {
                        price = Double.parseDouble(priceObj.toString());
                    } catch (Exception ignored) {}
                }

                int qty = 1;
                if (item.get("qty") != null) {
                    try {
                        qty = Integer.parseInt(item.get("qty").toString());
                    } catch (Exception ignored) {}
                }

                OrderItem orderItem = OrderItem.builder()
                        .productId(prodId)
                        .name((String) item.get("name"))
                        .discountPrice(price)
                        .qty(qty)
                        .shopId(shopId)
                        .isReviewed(false)
                        .build();

                shopItemsMap.computeIfAbsent(shopId, k -> new ArrayList<>()).add(orderItem);
            }

            // 5. Build and save orders with shopId populated
            List<Order> orders = new ArrayList<>();
            for (Map.Entry<Long, List<OrderItem>> entry : shopItemsMap.entrySet()) {
                Long shopId = entry.getKey();
                List<OrderItem> items = entry.getValue();
                double shopTotal = items.stream().mapToDouble(i -> i.getDiscountPrice() * i.getQty()).sum();

                Order order = Order.builder()
                        .cart(items)
                        .shippingAddress(shipping)
                        .userId(userId)
                        .userName(userName)
                        .userEmail(userEmail)
                        .shopId(shopId) // Works now!
                        .totalPrice(shopTotal)
                        .status("Processing")
                        .paymentInfo(paymentInfo)
                        .build();

                orders.add(orderRepository.save(order));
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "orders", orders));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error creating order: " + e.getMessage()));
        }
    }

    private Long extractShopId(Map<String, Object> item) {
        if (item.get("shopId") != null) {
            try {
                return Long.valueOf(item.get("shopId").toString());
            } catch (Exception ignored) {}
        }
        if (item.get("shop") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> shop = (Map<String, Object>) item.get("shop");
            Object sid = shop.get("_id") != null ? shop.get("_id") : shop.get("id");
            if (sid != null) {
                try {
                    return Long.valueOf(sid.toString());
                } catch (Exception ignored) {}
            }
        }
        return 1L;
    }

    private Long extractProductId(Map<String, Object> item) {
        Object pid = item.get("_id") != null ? item.get("_id") : (item.get("productId") != null ? item.get("productId") : item.get("id"));
        if (pid != null) {
            try {
                return Long.valueOf(pid.toString());
            } catch (Exception ignored) {}
        }
        return 1L;
    }

    @GetMapping("/get-all-orders/{userId}")
    public ResponseEntity<?> getAllOrdersOfUser(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("success", true, "orders", orderRepository.findByUserIdOrderByCreatedAtDesc(userId)));
    }

    @GetMapping("/get-seller-all-orders/{shopId}")
    public ResponseEntity<?> getAllOrdersOfSeller(@PathVariable Long shopId) {
        return ResponseEntity.ok(Map.of("success", true, "orders", orderRepository.findByShopIdOrderByCreatedAtDesc(shopId)));
    }

    @PutMapping("/update-order-status/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal Shop seller) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Order not found with this id"));

        Order order = orderOpt.get();
        String status = body.get("status");

        if ("Transferred to delivery partner".equals(status)) {
            for (OrderItem item : order.getCart()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStock(p.getStock() - item.getQty());
                    p.setSold_out(p.getSold_out() + item.getQty());
                    productRepository.save(p);
                });
            }
        }

        order.setStatus(status);

        if ("Delivered".equals(status)) {
            order.setDeliveredAt(LocalDateTime.now());
            order.getPaymentInfo().setStatus("Succeeded");
            double serviceCharge = order.getTotalPrice() * 0.10;
            if (seller != null) {
                seller.setAvailableBalance(seller.getAvailableBalance() + (order.getTotalPrice() - serviceCharge));
                shopRepository.save(seller);
            }
        }

        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "order", order));
    }

    @PutMapping("/order-refund/{id}")
    public ResponseEntity<?> requestRefund(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Order not found with this id"));
        Order order = orderOpt.get();
        order.setStatus(body.get("status"));
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "order", order, "message", "Order Refund Request successfully!"));
    }

    @PutMapping("/order-refund-success/{id}")
    public ResponseEntity<?> acceptRefund(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Order not found with this id"));
        Order order = orderOpt.get();
        String status = body.get("status");
        order.setStatus(status);

        if ("Refund Success".equals(status)) {
            for (OrderItem item : order.getCart()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStock(p.getStock() + item.getQty());
                    p.setSold_out(p.getSold_out() - item.getQty());
                    productRepository.save(p);
                });
            }
        }
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("success", true, "message", "Order Refund successfull!"));
    }

    @GetMapping("/admin-all-orders")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> getAllOrdersAdmin() {
        return ResponseEntity.ok(Map.of("success", true, "orders", orderRepository.findAllByOrderByDeliveredAtDescCreatedAtDesc()));
    }
}