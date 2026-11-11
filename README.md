# 🛒 ShopO — Multi-Vendor E-Commerce & Deals Platform

A full-stack, enterprise-grade multi-vendor e-commerce platform built with an **Angular (Standalone & Signals)** frontend, a **Spring Boot 3** RESTful backend, and **PostgreSQL** relational persistence.

---

## 📌 Overview

**ShopO** provides an end-to-end e-commerce experience for both buyers and sellers. It features dynamic deal countdowns, live discount percentage badges, an interactive cart slide-over drawer with free-shipping indicators, a multi-step checkout flow with Stripe integration, and dedicated seller dashboards for managing store inventory and limited-time events.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Product Catalog & Browsing**: Filter by categories, tags, or keyword searches with real-time UI updates.
- **Flash Sales & Limited Deals**: Highlighting original retail prices (MRP), special deal prices, dynamic discount percentage badges, and countdown timers.
- **Interactive Cart Drawer**: Real-time sliding drawer featuring item quantity management (`−` / `+`), individual item removal, free shipping progress goals, and subtotal calculations in Indian Rupees (₹).
- **Checkout & Payments**: Integrated Stripe payment processing and Cash on Delivery (COD) options.
- **Account & Orders**: Order timeline tracking, purchase history, and delivery status updates.

### 🏪 Seller & Shop Dashboard
- **Shop Management**: Dedicated registration and login workflows for sellers to manage store profiles, avatars, and contact information.
- **Product Management**: Upload multiple product banners with automatic browser-side canvas resizing to optimize payloads and image rendering.
- **Promotional Events Engine**: Create time-bound promotional deals with automated validity date scheduling (`start_Date` / `finish_Date`) and discount tracking.
- **Order Tracking**: Real-time insights into store-level order fulfillment and sold-out metrics.

---

## 🛠️ Tech Stack

### Frontend (`eshop-frontend`)
- **Framework**: Angular 17+ (Standalone Components, Angular Signals)
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: Reactive Signal-based state stores (`CartStore`, `EventStore`, `ProductStore`, `SellerStore`, `UserStore`)
- **Icons & UI**: Feather / React Icons adapted for Angular (`IconComponent`)
- **Media Delivery**: Cloudinary CDN with client-side image compression

### Backend (`eshop-backend`)
- **Language / Runtime**: Java 17+, Spring Boot 3+
- **Security**: Spring Security 6 with stateless JWT (JSON Web Tokens)
- **Database ORM**: Spring Data JPA & Hibernate
- **Database Engine**: PostgreSQL
- **File / Image Storage**: Cloudinary Java SDK
- **Mailing**: Spring Boot Starter Mail with Gmail SMTP integration
- **Payments**: Stripe Java SDK

---

## 📁 Repository Structure

eshop-fullstack/
├── .gitignore
├── README.md
├── eshop-backend/                        # Spring Boot 3 Application
│   ├── mvnw / mvnw.cmd
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/eshop/
│       │   ├── controller/               # REST Endpoints (Auth, Product, Event, Shop, etc.)
│       │   ├── model/                    # JPA Entities (User, Shop, Product, Event, etc.)
│       │   ├── repository/               # Spring Data Repositories
│       │   └── service/                  # Business Logic, Cloudinary & Stripe Services
│       └── resources/
│           ├── application.properties    # Base configuration with environment variable fallbacks
│           └── application-local.properties.example # Template for local credentials
│
└── eshop-frontend/                       # Angular Standalone Application
    ├── package.json
    ├── angular.json
    ├── tailwind.config.js
    └── src/app/
        ├── components/                   # Reusable UI (Cart, EventCard, Navbar, Footer, etc.)
        ├── core/                         # Signal Stores, Models, Toast & Icon services
        ├── routes/                       # Application Pages (Home, Product, Events, Checkout)
        └── static/                       # Static category lists and dummy assets



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


👨‍💻 Author
Atul Chandra (GitHub @Chandra-Atul)
