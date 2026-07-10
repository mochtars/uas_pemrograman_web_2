"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ikonKategori = {
  "Roti Manis": "🍞",
  "Roti Tawar": "🥖",
  Pastry: "🥐",
  "Donat & Kue": "🍩",
  Minuman: "🥤",
};

const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

export default function Home() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/produk")
      .then((res) => res.json())
      .then((data) => setProduk(data))
      .finally(() => setLoading(false));
  }, []);

  const kategoriList = [...new Set(produk.map((p) => p.kategori))];

  return (
    <div>
      <section className="bg-gradient-to-r from-stone-900 to-amber-900 text-white rounded-2xl p-10 mb-10 text-center shadow-xl">
        <h1 className="text-4xl font-bold mb-3">🍞 Roti Ben-oi</h1>
        <p className="text-amber-100 mb-6 max-w-xl mx-auto">
          Roti hangat fresh from the oven setiap hari. Pesan sekarang,
          kami panggang dengan sepenuh hati.
        </p>
        <Link
          href="/pesanan/baru"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-6 py-3 rounded-full transition shadow"
        >
          Buat Pesanan
        </Link>
      </section>

      {loading ? (
        <p className="text-center text-stone-500">Memuat menu...</p>
      ) : (
        kategoriList.map((kat) => (
          <section key={kat} className="mb-10">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">
              {ikonKategori[kat] || "🍽️"} {kat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produk
                .filter((p) => p.kategori === kat)
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition border border-stone-200"
                  >
                    <div className="text-4xl mb-3">{ikonKategori[p.kategori] || "🍽️"}</div>
                    <h3 className="font-semibold text-lg text-stone-800">{p.nama}</h3>
                    <p className="text-sm text-stone-500 mb-3 min-h-10">{p.deskripsi}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-700">{rupiah(p.harga)}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.stok > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.stok > 0 ? `Stok: ${p.stok}` : "Habis"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
