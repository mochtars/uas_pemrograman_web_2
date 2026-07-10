require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 4000;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/toko_roti",
});

app.use(cors());
app.use(express.json());

// ================= CRUD PRODUK =================

// GET /api/produk : ambil semua produk
app.get("/api/produk", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM produk ORDER BY id");
  res.json(rows);
});

// GET /api/produk/:id : detail satu produk
app.get("/api/produk/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM produk WHERE id = $1", [
    req.params.id,
  ]);
  if (rows.length === 0) {
    return res.status(404).json({ error: "Produk tidak ditemukan" });
  }
  res.json(rows[0]);
});

// POST /api/produk : tambah produk baru
app.post("/api/produk", async (req, res) => {
  const { nama, deskripsi, kategori, harga, stok } = req.body;
  if (!nama || !harga) {
    return res.status(400).json({ error: "Nama dan harga wajib diisi" });
  }
  const { rows } = await pool.query(
    `INSERT INTO produk (nama, deskripsi, kategori, harga, stok)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nama, deskripsi || "", kategori || "Roti Manis", harga, stok || 0]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/produk/:id : ubah produk
app.put("/api/produk/:id", async (req, res) => {
  const { nama, deskripsi, kategori, harga, stok } = req.body;
  const { rows } = await pool.query(
    `UPDATE produk
     SET nama = $1, deskripsi = $2, kategori = $3, harga = $4, stok = $5
     WHERE id = $6 RETURNING *`,
    [nama, deskripsi, kategori, harga, stok, req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Produk tidak ditemukan" });
  }
  res.json(rows[0]);
});

// DELETE /api/produk/:id : hapus produk
app.delete("/api/produk/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM produk WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    res.json({ message: "Produk dihapus" });
  } catch (err) {
    // 23503 = pelanggaran foreign key (produk sudah dipakai di pesanan)
    if (err.code === "23503") {
      return res.status(409).json({
        error: "Produk tidak bisa dihapus karena sudah ada di pesanan",
      });
    }
    throw err;
  }
});

// ================= CRUD PESANAN =================

const queryPesananLengkap = `
  SELECT p.*,
    COALESCE(json_agg(
      json_build_object(
        'id', pi.id,
        'produk_id', pi.produk_id,
        'nama_produk', pr.nama,
        'jumlah', pi.jumlah,
        'harga_satuan', pi.harga_satuan
      )
    ) FILTER (WHERE pi.id IS NOT NULL), '[]') AS items
  FROM pesanan p
  LEFT JOIN pesanan_item pi ON pi.pesanan_id = p.id
  LEFT JOIN produk pr ON pr.id = pi.produk_id
`;

// GET /api/pesanan : ambil semua pesanan beserta itemnya
app.get("/api/pesanan", async (req, res) => {
  const { rows } = await pool.query(
    queryPesananLengkap + " GROUP BY p.id ORDER BY p.id DESC"
  );
  res.json(rows);
});

// GET /api/pesanan/:id : detail satu pesanan beserta itemnya
app.get("/api/pesanan/:id", async (req, res) => {
  const { rows } = await pool.query(
    queryPesananLengkap + " WHERE p.id = $1 GROUP BY p.id",
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }
  res.json(rows[0]);
});

// POST /api/pesanan : buat pesanan baru beserta item, kurangi stok produk
app.post("/api/pesanan", async (req, res) => {
  const { nama_pelanggan, items } = req.body;
  if (!nama_pelanggan || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Nama pelanggan dan minimal 1 item wajib diisi" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let total = 0;
    const detail = [];
    for (const item of items) {
      const { rows } = await client.query(
        "SELECT id, nama, harga, stok FROM produk WHERE id = $1 FOR UPDATE",
        [item.produk_id]
      );
      if (rows.length === 0) {
        throw {
          status: 404,
          message: `Produk id ${item.produk_id} tidak ditemukan`,
        };
      }
      const produk = rows[0];
      if (produk.stok < item.jumlah) {
        throw {
          status: 400,
          message: `Stok ${produk.nama} tidak cukup (sisa ${produk.stok})`,
        };
      }
      total += produk.harga * item.jumlah;
      detail.push({ ...item, harga_satuan: produk.harga });
    }

    const { rows: pesananRows } = await client.query(
      "INSERT INTO pesanan (nama_pelanggan, total) VALUES ($1, $2) RETURNING *",
      [nama_pelanggan, total]
    );
    const pesanan = pesananRows[0];

    for (const item of detail) {
      await client.query(
        `INSERT INTO pesanan_item (pesanan_id, produk_id, jumlah, harga_satuan)
         VALUES ($1, $2, $3, $4)`,
        [pesanan.id, item.produk_id, item.jumlah, item.harga_satuan]
      );
      await client.query("UPDATE produk SET stok = stok - $1 WHERE id = $2", [
        item.jumlah,
        item.produk_id,
      ]);
    }

    await client.query("COMMIT");
    res.status(201).json(pesanan);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  } finally {
    client.release();
  }
});

// PUT /api/pesanan/:id : ubah status pesanan (diproses/selesai/dibatalkan)
app.put("/api/pesanan/:id", async (req, res) => {
  const { status } = req.body;
  const valid = ["diproses", "selesai", "dibatalkan"];
  if (!valid.includes(status)) {
    return res
      .status(400)
      .json({ error: "Status harus salah satu dari: " + valid.join(", ") });
  }
  const { rows } = await pool.query(
    "UPDATE pesanan SET status = $1 WHERE id = $2 RETURNING *",
    [status, req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }
  res.json(rows[0]);
});

// DELETE /api/pesanan/:id : hapus pesanan (itemnya ikut terhapus via CASCADE)
app.delete("/api/pesanan/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM pesanan WHERE id = $1", [
    req.params.id,
  ]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }
  res.json({ message: "Pesanan dihapus" });
});

app.listen(PORT, () => {
  console.log(`Backend Roti Ben-oi berjalan di http://localhost:${PORT}`);
});
