# 🛒 ShopO — Full-Stack E-Commerce & Deals Platform

A modern, responsive multi-vendor marketplace built with an **Angular (Standalone & Signals)** frontend, a **Spring Boot 3** REST backend, and **PostgreSQL**.

## ⚡ Quick Start

### 1. Database

Create a PostgreSQL database named `eshop`:

```
CREATE DATABASE eshop;

```

### 2. Backend Setup

1. Navigate to `eshop-backend`:

   ```
   cd eshop-backend
   
   ```

2. Create your local secrets file:

   ```
   cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
   
   ```

3. Add your database password, Stripe, Cloudinary, and Gmail credentials to `application-local.properties`.

4. Run the server:

   ```
   ./mvnw spring-boot:run
   
   ```

   *Runs at `http://localhost:8000`.*

### 3. Frontend Setup

1. Navigate to `eshop-frontend`:

   ```
   cd eshop-frontend
   
   ```

2. Install dependencies & start:

   ```
   npm install
   npm start
   
   ```

   *Runs at `http://localhost:4200`.*

## 🛠️ Tech Stack

* **Frontend**: Angular 18+, Signals State Stores, Tailwind CSS

* **Backend**: Spring Boot 3, Spring Security 6, JWT, Spring Data JPA

* **Database**: PostgreSQL

* **Integrations**: Stripe API (Payments), Cloudinary (Images), Gmail SMTP (Mails)

## 🔒 Security Note

All sensitive tokens (Stripe, Cloudinary, Database credentials) are externalized via `application-local.properties` and excluded from Git tracking via `.gitignore`.
