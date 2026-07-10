"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const warnaStatus = {
  diproses: "bg-yellow-100 text-yellow-800",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
};

export default function DaftarPesanan() {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);

  const muat = () => {
    fetch("/api/pesanan")
      .then((res) => res.json())
      .then(setPesanan)
      .finally(() => setLoading(false));
  };

  useEffect(muat, []);

  const ubahStatus = async (id, status) => {
    await fetch(`/api/pesanan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    muat();
  };

  const hapus = async (id) => {
    if (!confirm("Yakin hapus pesanan ini?")) return;
    await fetch(`/api/pesanan/${id}`, { method: "DELETE" });
    muat();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-stone-800">🧾 Daftar Pesanan</h1>
        <Link
          href="/pesanan/baru"
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          + Pesanan Baru
        </Link>
      </div>

      {loading ? (
        <p className="text-stone-500">Memuat pesanan...</p>
      ) : pesanan.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-stone-500 shadow border border-stone-200">
          Belum ada pesanan. Yuk buat pesanan pertama!
        </div>
      ) : (
        <div className="space-y-4">
          {pesanan.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl p-5 shadow border border-stone-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <span className="font-bold text-stone-800">Pesanan #{p.id}</span>
                  <span className="text-stone-500 ml-2">a/n {p.nama_pelanggan}</span>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    warnaStatus[p.status] || "bg-stone-100 text-stone-600"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <ul className="text-sm text-stone-600 mb-3 divide-y divide-stone-100">
                {p.items.map((item) => (
                  <li key={item.id} className="py-1 flex justify-between">
                    <span>
                      {item.nama_produk} × {item.jumlah}
                    </span>
                    <span>{rupiah(item.harga_satuan * item.jumlah)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-700">
                  Total: {rupiah(p.total)}
                </span>
                <div className="flex gap-2 text-sm">
                  {p.status === "diproses" && (
                    <>
                      <button
                        onClick={() => ubahStatus(p.id, "selesai")}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Tandai Selesai
                      </button>
                      <button
                        onClick={() => ubahStatus(p.id, "dibatalkan")}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1.5 rounded-lg transition"
                      >
                        Batalkan
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => hapus(p.id)}
                    className="text-red-600 hover:underline px-2"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <p className="text-xs text-stone-400 mt-2">
                {new Date(p.dibuat_pada).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
