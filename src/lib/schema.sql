-- DDL SQL Schema untuk RODA.MOTORKU
-- Sesuai Tabel 3.5 - 3.8 Dokumen Laporan Capstone Project 2026

-- 1. Tabel users (Tabel 3.5)
CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel motor (Tabel 3.6)
CREATE TABLE IF NOT EXISTS motor (
    id_motor SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    sku VARCHAR(50),
    nopol VARCHAR(30),
    merek VARCHAR(50) NOT NULL,
    tipe VARCHAR(100) NOT NULL,
    tahun INT NOT NULL,
    cc INT NOT NULL,
    kilometer INT NOT NULL,
    kondisi_mesin VARCHAR(50) NOT NULL,
    kelengkapan_dokumen VARCHAR(100) NOT NULL,
    domisili_samsat VARCHAR(100) NOT NULL,
    pajak_info VARCHAR(100),
    harga_beli BIGINT NOT NULL,
    harga_jual BIGINT NOT NULL,
    harga_pasar_coret BIGINT,
    deskripsi TEXT,
    status VARCHAR(20) DEFAULT 'Tersedia',
    views_week INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_motor_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

-- 3. Tabel foto_motor (Tabel 3.7)
CREATE TABLE IF NOT EXISTS foto_motor (
    id_foto SERIAL PRIMARY KEY,
    id_motor INT NOT NULL,
    nama_file VARCHAR(500) NOT NULL,
    label VARCHAR(50),
    caption VARCHAR(255),
    is_utama BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_foto_motor FOREIGN KEY (id_motor) REFERENCES motor(id_motor) ON DELETE CASCADE
);

-- 4. Tabel prediksi_harga (Tabel 3.8)
CREATE TABLE IF NOT EXISTS prediksi_harga (
    id_prediksi SERIAL PRIMARY KEY,
    kode_prediksi VARCHAR(50) NOT NULL UNIQUE,
    id_user INT NOT NULL,
    id_motor INT,
    nama_motor_katalog VARCHAR(100),
    nopol_katalog VARCHAR(30),
    kode_motor_katalog VARCHAR(50),
    catatan_simulasi VARCHAR(255),
    fitur_masukan JSONB NOT NULL,
    harga_estimasi BIGINT NOT NULL,
    spread_estimasi INT DEFAULT 350000,
    nama_model VARCHAR(100) NOT NULL,
    akurasi_r2 NUMERIC(5,2) NOT NULL,
    mae_rupiah BIGINT NOT NULL,
    rmse_rupiah BIGINT NOT NULL,
    detail_parameter_model VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediksi_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_prediksi_motor FOREIGN KEY (id_motor) REFERENCES motor(id_motor) ON DELETE SET NULL
);

-- Default Admin User (admin_otista) akan di-seed otomatis oleh repository.ts dengan hash scrypt dari password AdminRoda2026!
