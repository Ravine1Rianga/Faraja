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
    funeral_date     DATE,
    funeral_time     TIME,
    venue            VARCHAR(255),
    burial_site      VARCHAR(255),
    officiant        VARCHAR(150),
    mortuary         VARCHAR(150),
    fundraising_goal DECIMAL(12,2) NOT NULL DEFAULT 0,
    raised           DECIMAL(12,2) NOT NULL DEFAULT 0,
    privacy          VARCHAR(10) NOT NULL DEFAULT 'public',
    notify_msg       TEXT,
    status           VARCHAR(10) NOT NULL DEFAULT 'active',
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
