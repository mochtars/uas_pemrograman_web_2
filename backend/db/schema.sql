-- Skema database Toko Roti

DROP TABLE IF EXISTS pesanan_item;
DROP TABLE IF EXISTS pesanan;
DROP TABLE IF EXISTS produk;

CREATE TABLE produk (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  kategori VARCHAR(50) NOT NULL DEFAULT 'Roti Manis',
  harga INTEGER NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pesanan (
  id SERIAL PRIMARY KEY,
  nama_pelanggan VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'diproses',
  total INTEGER NOT NULL DEFAULT 0,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pesanan_item (
  id SERIAL PRIMARY KEY,
  pesanan_id INTEGER NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  jumlah INTEGER NOT NULL,
  harga_satuan INTEGER NOT NULL
);

-- Data awal
INSERT INTO produk (nama, deskripsi, kategori, harga, stok) VALUES
('Roti Coklat', 'Roti lembut isi coklat lumer premium', 'Roti Manis', 8000, 40),
('Roti Keju', 'Roti isi keju cheddar yang gurih dan creamy', 'Roti Manis', 9000, 40),
('Roti Srikaya', 'Roti isi selai srikaya pandan homemade', 'Roti Manis', 8500, 30),
('Roti Tawar Susu', 'Roti tawar lembut dengan susu segar', 'Roti Tawar', 16000, 25),
('Roti Tawar Gandum', 'Roti tawar gandum utuh, sehat dan mengenyangkan', 'Roti Tawar', 19000, 20),
('Croissant Butter', 'Croissant renyah berlapis dengan butter premium', 'Pastry', 18000, 25),
('Croissant Almond', 'Croissant dengan taburan almond dan krim', 'Pastry', 22000, 20),
('Donat Gula', 'Donat empuk klasik dengan taburan gula halus', 'Donat & Kue', 7000, 50),
('Brownies Coklat', 'Brownies panggang coklat pekat, fudgy di dalam', 'Donat & Kue', 25000, 15),
('Es Kopi Susu', 'Kopi susu gula aren, teman makan roti', 'Minuman', 15000, 30);
