"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

export default function PesananBaru() {
  const router = useRouter();
  const [produk, setProduk] = useState([]);
  const [nama, setNama] = useState("");
  const [keranjang, setKeranjang] = useState({}); // { produk_id: jumlah }
  const [error, setError] = useState(null);
  const [mengirim, setMengirim] = useState(false);

  useEffect(() => {
    fetch("/api/produk")
      .then((res) => res.json())
      .then(setProduk);
  }, []);

  const ubahJumlah = (id, delta, maks) => {
    setKeranjang((k) => {
      const sekarang = k[id] || 0;
      const baru = Math.max(0, Math.min(maks, sekarang + delta));
      const salinan = { ...k };
      if (baru === 0) delete salinan[id];
      else salinan[id] = baru;
      return salinan;
    });
  };

  const total = produk.reduce(
    (sum, p) => sum + (keranjang[p.id] || 0) * p.harga,
    0
  );

  const kirim = async () => {
    setError(null);
    const items = Object.entries(keranjang).map(([produk_id, jumlah]) => ({
      produk_id: Number(produk_id),
      jumlah,
    }));
    if (!nama.trim()) return setError("Nama pelanggan wajib diisi");
    if (items.length === 0) return setError("Pilih minimal 1 produk");

    setMengirim(true);
    const res = await fetch("/api/pesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_pelanggan: nama, items }),
    });
    if (res.ok) {
      router.push("/pesanan");
    } else {
      const data = await res.json();
      setError(data.error || "Terjadi kesalahan");
      setMengirim(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-800 mb-6">🛒 Buat Pesanan</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow border border-stone-200 mb-6">
        <label className="block text-sm font-medium text-stone-600 mb-1">
          Nama Pelanggan
        </label>
        <input
          className="border border-stone-300 rounded-lg px-3 py-2 w-full sm:w-80"
          placeholder="Contoh: Beni"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow border border-stone-200 divide-y divide-stone-100 mb-6">
        {produk.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium text-stone-800">{p.nama}</p>
              <p className="text-sm text-stone-500">
                {rupiah(p.harga)} · stok {p.stok}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => ubahJumlah(p.id, -1, p.stok)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 font-bold text-stone-700"
              >
                −
              </button>
              <span className="w-6 text-center font-medium">
                {keranjang[p.id] || 0}
              </span>
              <button
                onClick={() => ubahJumlah(p.id, 1, p.stok)}
                disabled={p.stok === 0}
                className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:bg-stone-200 disabled:text-stone-400"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 bg-stone-900 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-xl">
        <span className="font-bold text-lg">Total: {rupiah(total)}</span>
        <button
          onClick={kirim}
          disabled={mengirim}
          className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-6 py-2 rounded-full transition disabled:opacity-50"
        >
          {mengirim ? "Mengirim..." : "Pesan Sekarang"}
        </button>
      </div>
    </div>
  );
}
