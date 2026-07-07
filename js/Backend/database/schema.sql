-- ================================================================
--  FARAJA PLATFORM — MySQL Schema (Laragon / HeidiSQL)
--  Run this in HeidiSQL to create the faraja database.
-- ================================================================

CREATE DATABASE IF NOT EXISTS faraja_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE faraja_db;

-- ----------------------------------------------------------------
-- ROLES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO roles (name) VALUES
    ('admin'),('family'),('contributor'),('vendor'),('committee')
ON DUPLICATE KEY UPDATE name=name;

-- ----------------------------------------------------------------
-- USERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    role_id       INT NOT NULL DEFAULT 2,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    phone         VARCHAR(25),
    profile_photo VARCHAR(255),
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- PASSWORD RESET TOKENS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used       TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- FUNERAL PROJECTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS funeral_projects (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    created_by       INT NOT NULL,
    deceased_name    VARCHAR(150) NOT NULL,
    date_of_birth    DATE,
    date_of_death    DATE,
    biography        TEXT,
    photo            VARCHAR(255),
    gallery_photos    TEXT,
    funeral_date     DATE,
    funeral_time     TIME,
    venue            VARCHAR(255),
    livestream_url   VARCHAR(500),
    burial_site      VARCHAR(255),
    officiant        VARCHAR(150),
    mortuary         VARCHAR(150),
    fundraising_goal DECIMAL(12,2) NOT NULL DEFAULT 0,
    raised           DECIMAL(12,2) NOT NULL DEFAULT 0,
    privacy          VARCHAR(10) NOT NULL DEFAULT 'public',
    notify_msg       TEXT,
    status           VARCHAR(10) NOT NULL DEFAULT 'active',
    tier             VARCHAR(20) NOT NULL DEFAULT 'free',
    premium_expires_at DATETIME NULL,
    order_of_service TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- COMMITTEE MEMBERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS committee_members (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    funeral_id     INT NOT NULL,
    user_id        INT,
    name           VARCHAR(150) NOT NULL,
    phone          VARCHAR(25),
    email          VARCHAR(150),
    location       VARCHAR(150),
    committee_role VARCHAR(100),
    joined_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funeral_id) REFERENCES funeral_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- TASKS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    funeral_id   INT NOT NULL,
    assigned_to  INT,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    priority     VARCHAR(10) NOT NULL DEFAULT 'medium',
    status       VARCHAR(20) NOT NULL DEFAULT 'todo',
    due_date     DATE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (funeral_id) REFERENCES funeral_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES committee_members(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- CONTRIBUTIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contributions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    funeral_id       INT NOT NULL,
    user_id          INT,
    contributor_name VARCHAR(150),
    amount           DECIMAL(10,2) NOT NULL,
    platform_fee     DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method   VARCHAR(10) NOT NULL DEFAULT 'mpesa',
    message          TEXT,
    is_anonymous     TINYINT(1) NOT NULL DEFAULT 0,
    status           VARCHAR(10) NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funeral_id) REFERENCES funeral_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- TRANSACTIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    contribution_id INT NOT NULL,
    mpesa_code      VARCHAR(30),
    phone           VARCHAR(25),
    amount          DECIMAL(10,2) NOT NULL,
    checkout_req_id VARCHAR(100),
    status          VARCHAR(10) NOT NULL DEFAULT 'pending',
    raw_callback    JSON,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- VENDORS / SERVICE PROVIDERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL UNIQUE,
    business_name    VARCHAR(200) NOT NULL,
    category         VARCHAR(100) NOT NULL DEFAULT 'Other',
    location         VARCHAR(200),
    phone            VARCHAR(25),
    email            VARCHAR(150),
    description      TEXT,
    rating           DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    verified         TINYINT(1) NOT NULL DEFAULT 0,
    views            INT NOT NULL DEFAULT 0,
    status           VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- VENDOR PRODUCTS / MERCHANDISE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id     INT NOT NULL,
    name          VARCHAR(200) NOT NULL,
    category      VARCHAR(100) NOT NULL DEFAULT 'Other',
    price         DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock         INT NOT NULL DEFAULT 0,
    description   TEXT,
    image_url     VARCHAR(500),
    status        VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- EXPENSES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    funeral_id   INT NOT NULL,
    recorded_by  INT,
    paid_by      VARCHAR(150),
    description  VARCHAR(255) NOT NULL,
    category     VARCHAR(100),
    amount       DECIMAL(10,2) NOT NULL,
    status       VARCHAR(10) NOT NULL DEFAULT 'pending',
    notes        TEXT,
    expense_date DATE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (funeral_id) REFERENCES funeral_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- BOOKINGS (vendor service requests)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    funeral_id        INT NOT NULL,
    vendor_id         INT NOT NULL,
    product_id        INT,
    requested_by      INT NOT NULL,
    service_date      DATE,
    amount            DECIMAL(10,2) NOT NULL,
    commission_pct    DECIMAL(4,2) NOT NULL DEFAULT 7.5,
    commission_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount * commission_pct / 100) STORED,
    status            VARCHAR(15) NOT NULL DEFAULT 'requested',
    notes             TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (funeral_id) REFERENCES funeral_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (requested_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id  INT NOT NULL,
    user_id    INT NOT NULL,
    rating     TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- CONDOLENCES (guestbook on memorial page)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS condolences (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    funeral_id  INT NOT NULL,
    name        VARCHAR(150) NOT NULL DEFAULT 'Anonymous',
    email       VARCHAR(150),
    message     TEXT NOT NULL,
    relationship VARCHAR(100),
    is_approved TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funeral_id) REFERENCES funeral_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------
-- SEED DATA
-- ----------------------------------------------------------------
INSERT IGNORE INTO users (role_id, name, email, password_hash)
VALUES (1, 'Admin', 'admin@faraja.co.ke', '$2b$12$kzu5SpvRM4wJqJiZPZG08u1HzdQvzfih1ZeU94fStoJnF29.UFtoG');
-- Admin credentials: admin@faraja.co.ke / admin123
