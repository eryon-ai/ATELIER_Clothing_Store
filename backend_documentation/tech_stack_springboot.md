# Spring Boot + PostgreSQL Architecture Blueprint
**The Enterprise Choice for ATELIER E-Commerce**

This document provides every detail necessary to construct the Spring Boot backend for the ATELIER platform from scratch.

---

## 1. Initial Setup & Dependencies

**Initialization:**
Use [Spring Initializr](https://start.spring.io/) with the following settings:
- **Project:** Maven or Gradle (Maven recommended for enterprise).
- **Language:** Java 21 or Kotlin.
- **Spring Boot Version:** 3.x+

**Core Dependencies (`pom.xml`):**
```xml
<!-- Web, Security, and Database -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
<dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId></dependency>

<!-- Validation & Migration -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>

<!-- JWT Auth -->
<dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>0.11.5</version></dependency>

<!-- Boilerplate Reduction -->
<dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
```

---

## 2. Complete Folder Structure

```text
src/
├── main/
│   ├── java/com/atelier/
│   │   ├── AtelierApplication.java
│   │   ├── config/              # SecurityConfig, CorsConfig, GlobalExceptionHandler
│   │   ├── security/            # JwtUtils, AuthFilter, CustomUserDetailsService
│   │   ├── common/              # BaseEntity (CreatedAt/UpdatedAt), DTOs, Enums
│   │   ├── modules/
│   │   │   ├── auth/            # AuthController, AuthService, LoginRequestDTO
│   │   │   ├── catalog/         # ProductController, ProductService, ProductRepository, ProductEntity
│   │   │   ├── order/           # OrderController, OrderService (Strict @Transactional)
│   │   │   ├── inventory/       # WarehouseEntity, StockTransferService
│   │   │   ├── crm/             # CustomerEntity, TicketService
│   │   │   └── financials/      # InvoiceEntity, AnalyticsService
│   ├── resources/
│   │   ├── application.yml      # DB connections, JWT secrets, Server port
│   │   └── db/migration/        # Flyway SQL migration scripts (V1__init.sql)
```

---

## 3. Step-by-Step Implementation Details

### Step 1: Database & Migrations (`Flyway`)
Do not let Hibernate auto-generate your schema in production (`spring.jpa.hibernate.ddl-auto=validate`).
Instead, write raw SQL scripts in `src/main/resources/db/migration/`.
```sql
-- V1__init_schema.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Architecture Pattern (Controller -> Service -> Repository)

**1. Entity (`ProductEntity.java`):**
Map the Java class to the Postgres table using JPA annotations.
```java
@Entity
@Table(name = "products")
@Data // Lombok
public class ProductEntity {
    @Id @GeneratedValue
    private UUID id;
    private String name;
    private Double price;
    
    // For dynamic variants (JSONB in Postgres)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> variants;
}
```

**2. Repository (`ProductRepository.java`):**
Extend Spring Data JPA interfaces for free CRUD queries.
```java
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    List<ProductEntity> findByCategoryAndIsPublishedTrue(String category);
}
```

**3. Service (`OrderService.java`):**
Business logic goes here. **Crucial:** Use `@Transactional` to ensure that deducting inventory and creating an order happens atomically. If one fails, the database rolls back everything.
```java
@Service
@RequiredArgsConstructor // Lombok constructor injection
public class OrderService {
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public OrderResponseDTO placeOrder(UUID userId, OrderRequestDTO req) {
        // 1. Lock inventory rows (Pessimistic Locking)
        // 2. Deduct inventory
        // 3. Save OrderEntity
        // 4. Save TimelineEventEntity
    }
}
```

**4. Controller (`OrderController.java`):**
Expose the REST API. Use `@PreAuthorize` for RBAC.
```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO req) {
        // Call Service
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestBody UpdateStatusDTO req) {
        // Call Service
    }
}
```

### Step 3: Security & JWT Middleware
1. Create a `JwtUtils.java` to generate and parse JWTs using the `jjwt` library.
2. Create a `JwtAuthFilter.java` that extends `OncePerRequestFilter`. It should extract the `Authorization: Bearer <token>` header, validate it, and set the `SecurityContextHolder`.
3. Create `SecurityConfig.java`:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/v1/storefront/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

## 4. Deployment Strategy
1. Package the application: `./mvnw clean package -DskipTests`.
2. This generates a fat JAR: `target/atelier-0.0.1-SNAPSHOT.jar`.
3. Create a `Dockerfile`:
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```
4. Deploy the Docker image to **AWS ECS** or **Render**. Connect it to a managed PostgreSQL database instance.
