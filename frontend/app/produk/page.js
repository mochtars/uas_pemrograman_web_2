"use client";

import { useEffect, useState } from "react";

const formKosong = {
  nama: "",
  deskripsi: "",
  kategori: "Roti Manis",
  harga: "",
  stok: "",
};

const kategoriPilihan = ["Roti Manis", "Roti Tawar", "Pastry", "Donat & Kue", "Minuman"];
const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

export default function KelolaProduk() {
  const [produk, setProduk] = useState([]);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState(null);
  const [pesan, setPesan] = useState(null);

  const muatProduk = () => {
    fetch("/api/produk")
      .then((res) => res.json())
      .then(setProduk);
  };

  useEffect(muatProduk, []);

  const tampilkanPesan = (teks, sukses = true) => {
    setPesan({ teks, sukses });
    setTimeout(() => setPesan(null), 3000);
  };

  const simpan = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      harga: Number(form.harga),
      stok: Number(form.stok),
    };
    const res = await fetch(editId ? `/api/produk/${editId}` : "/api/produk", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      tampilkanPesan(editId ? "Produk berhasil diubah" : "Produk berhasil ditambah");
      setForm(formKosong);
      setEditId(null);
      muatProduk();
    } else {
      const data = await res.json();
      tampilkanPesan(data.error || "Terjadi kesalahan", false);
    }
  };

  const mulaiEdit = (p) => {
    setEditId(p.id);
    setForm({
      nama: p.nama,
      deskripsi: p.deskripsi || "",
      kategori: p.kategori,
      harga: p.harga,
      stok: p.stok,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hapus = async (id) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    const res = await fetch(`/api/produk/${id}`, { method: "DELETE" });
    const data = await res.json();
    tampilkanPesan(res.ok ? "Produk dihapus" : data.error, res.ok);
    muatProduk();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-800 mb-6">📦 Kelola Produk</h1>

      {pesan && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            pesan.sukses ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <form
        onSubmit={simpan}
        className="bg-white rounded-xl p-6 shadow mb-8 border border-stone-200"
      >
        <h2 className="font-semibold text-lg mb-4 text-stone-700">
          {editId ? `Edit Produk #${editId}` : "Tambah Produk Baru"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            className="border border-stone-300 rounded-lg px-3 py-2"
            placeholder="Nama produk"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
          />
          <select
            className="border border-stone-300 rounded-lg px-3 py-2 bg-white"
            value={form.kategori}
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
          >
            {kategoriPilihan.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <input
            className="border border-stone-300 rounded-lg px-3 py-2"
            type="number"
            min="0"
            placeholder="Harga (Rp)"
            value={form.harga}
            onChange={(e) => setForm({ ...form, harga: e.target.value })}
            required
          />
          <input
            className="border border-stone-300 rounded-lg px-3 py-2"
            type="number"
            min="0"
            placeholder="Stok"
            value={form.stok}
            onChange={(e) => setForm({ ...form, stok: e.target.value })}
            required
          />
          <textarea
            className="border border-stone-300 rounded-lg px-3 py-2 sm:col-span-2"
            placeholder="Deskripsi singkat"
            rows={2}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            {editId ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(formKosong);
              }}
              className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-5 py-2 rounded-lg transition"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-800 text-stone-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-right">Harga</th>
              <th className="px-4 py-3 text-right">Stok</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map((p) => (
              <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-400">{p.id}</td>
                <td className="px-4 py-3 font-medium text-stone-800">{p.nama}</td>
                <td className="px-4 py-3">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                    {p.kategori}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{rupiah(p.harga)}</td>
                <td className="px-4 py-3 text-right">{p.stok}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => mulaiEdit(p)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => hapus(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
