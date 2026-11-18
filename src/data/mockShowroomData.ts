import { DATASET_187_MOTORS } from "./dataset187Motors";

export interface User {
  id_user: number;
  nama: string;
  username: string;
  role: "admin";
  created_at: string;
}

export interface FotoMotor {
  id_foto: number;
  id_motor: number;
  nama_file: string;
  label: string;
  caption: string;
  is_utama: boolean;
}

export interface Motor {
  id_motor: number;
  id_user: number;
  sku: string;
  nopol: string;
  merek: "Honda" | "Yamaha" | "Suzuki" | "Kawasaki" | "Vespa";
  tipe: string;
  tahun: number;
  cc: number;
  kilometer: number;
  kondisi_mesin: string;
  kelengkapan_dokumen: string;
  domisili_samsat: string;
  pajak_info: string;
  harga_beli: number;
  harga_jual: number;
  harga_pasar_coret?: number;
  deskripsi: string;
  status: "Tersedia" | "Terjual";
  created_at: string;
  views_week: number;
  foto_motor: FotoMotor[];
}

export interface FiturMasukanML {
  merek: string;
  tahun: number;
  kelengkapan_dokumen: string;
  kilometer: number;
  harga_beli: number;
  kondisi_mesin: string;
  domisili_samsat: string;
  cc: number;
}

export interface PrediksiHarga {
  id_prediksi: number;
  kode_prediksi: string;
  id_user: number;
  id_motor: number | null;
  nama_motor_katalog?: string;
  nopol_katalog?: string;
  kode_motor_katalog?: string;
  catatan_simulasi?: string;
  fitur_masukan: FiturMasukanML;
  harga_estimasi: number;
  spread_estimasi: number;
  nama_model:
    | "Random Forest Regressor v1.4"
    | "Linear Regression"
    | "Decision Tree Regressor";
  akurasi_r2: number;
  mae_rupiah: number;
  rmse_rupiah: number;
  detail_parameter_model: string;
  created_at: string;
  waktu_relatif: string;
}

export interface ModelMetric {
  id: "rf" | "lr" | "dt";
  nama_model:
    | "Random Forest Regressor v1.4"
    | "Linear Regression"
    | "Decision Tree Regressor";
  short_name: string;
  r2_score: number;
  mae: number;
  rmse: number;
  hyperparameter_info: string;
  is_best: boolean;
}

export const MODEL_METRICS: ModelMetric[] = [
  {
    id: "rf",
    nama_model: "Random Forest Regressor v1.4",
    short_name: "Random Forest",
    r2_score: 0.946,
    mae: 450000,
    rmse: 615000,
    hyperparameter_info: "n_estimators: 150, One-Hot Encoding (80:20 Split)",
    is_best: true,
  },
  {
    id: "lr",
    nama_model: "Linear Regression",
    short_name: "Linear Regression",
    r2_score: 0.894,
    mae: 680000,
    rmse: 890000,
    hyperparameter_info: "Multi-Feature OLS, One-Hot Encoding (80:20 Split)",
    is_best: false,
  },
  {
    id: "dt",
    nama_model: "Decision Tree Regressor",
    short_name: "Decision Tree",
    r2_score: 0.912,
    mae: 590000,
    rmse: 810000,
    hyperparameter_info: "max_depth: 8, One-Hot Encoding (80:20 Split)",
    is_best: false,
  },
];

export const INITIAL_MOTORS: Motor[] = DATASET_187_MOTORS;

export const OLD_INITIAL_MOTORS: Motor[] = [
  {
    id_motor: 1,
    id_user: 1,
    sku: "RDK-23-VR160-JKT",
    nopol: "B 4819 KOX",
    merek: "Honda",
    tipe: "Vario 160 CBS",
    tahun: 2023,
    cc: 160,
    kilometer: 12450,
    kondisi_mesin: "Sangat Baik",
    kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
    domisili_samsat: "Jakarta Selatan (Plat B)",
    pajak_info: "Pajak hidup s/d Oktober 2026",
    harga_beli: 19500000,
    harga_jual: 23500000,
    harga_pasar_coret: 24800000,
    deskripsi:
      "Tangan pertama dari baru, bodi mulus 95%, ban depan-belakang masih tebal 90%, kelistrikan & starter normal tanpa kendala, siap pakai jarak jauh. Kunci kontak 2 pcs (Smart Key Remote asli lengkap dengan barcode tag).",
    status: "Tersedia",
    created_at: "2026-10-24 14:35:00",
    views_week: 184,
    foto_motor: [
      {
        id_foto: 101,
        id_motor: 1,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCeKZ6MHGP-odobRcjSN-aeaH9mdtyoJ2dn65ZX8HrTay_V4JYgDcoX7_cTXUtpRTXniFBvA2DgZTwfGUbsSgVfjvZBSy1eNHF-33AoMDkL4U7opyMGLYO3RRVpmeZqB--q3mKZ7FZeJQtqr1gXZHRoypMyY-oaHFKsEbdnP4Gfu7468vat38VLiJg6DpwAhwOFbmTsG0SnvrNrDYc1WyDUxizFwV8CsMwX3aiigg6F",
        label: "Tampak Depan",
        caption: "Tampak Depan (Depan Kanan 45°)",
        is_utama: true,
      },
      {
        id_foto: 102,
        id_motor: 1,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAMsI9k2qZ58VV6Dd8AfOC5KpKWxTp1oJEkPIUiODzIxgwaECsFXmfaZK_x-qKRQ_yOi_cwhYx0JbHbEVr_UwTxF9zg7GqeGMtm4bf98i8XdzScE-NukMEfrgeVcm9FXxozwkUP7fS5VnMDqq9SE6naq4SUR1hJ8jSBCtil7m9-g_pxPVb6ABWojASQMTW_tECU5Hp6N25hNugOTmkJdk6IMt-YmQLs2GKpU15Uvt1s",
        label: "Tampak Samping",
        caption: "Tampak Samping Penuh (Kiri & Knalpot Rapi)",
        is_utama: false,
      },
      {
        id_foto: 103,
        id_motor: 1,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
        label: "Speedometer",
        caption: "Speedometer Digital & Odometer Asli 12.450 km",
        is_utama: false,
      },
      {
        id_foto: 104,
        id_motor: 1,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA13sV-oQ8hcjN01VGLQK8vraxl6IdCGSYmDZ3eUy61zqHPuvvM2OXxehX2jnXZulPV0QBWN9MocqqM9FqVtZixiCHjT9GP7LEf01tY02wW4MA5kzawXZhYk0hFgRezd3vxSQItUsE8pbMdDNDJd9NgEnwvrcBUAOOLAiVswznYYLMVpRys6JappAjVH5kUI41K9hbFpeCsyjbHrTdPfkAm1EvqJj-ans8l0Dg62IxU",
        label: "STNK & BPKB",
        caption: "Kelengkapan Dokumen Fisik: BPKB Biru, STNK Asli, & Faktur",
        is_utama: false,
      },
    ],
  },
  {
    id_motor: 2,
    id_user: 1,
    sku: "RDK-22-NMAX155-BDG",
    nopol: "B 3912 PXA",
    merek: "Yamaha",
    tipe: "NMAX 155 Connected",
    tahun: 2022,
    cc: 155,
    kilometer: 18200,
    kondisi_mesin: "Sangat Baik",
    kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
    domisili_samsat: "Depok (Plat B)",
    pajak_info: "Pajak hidup s/d Desember 2026",
    harga_beli: 23000000,
    harga_jual: 27800000,
    harga_pasar_coret: 29000000,
    deskripsi:
      "Yamaha NMAX 155 Connected 2022 terawat istimewa, fitur Y-Connect aktif, suspensi tabung empuk, servis berkala rutin di bengkel resmi Yamaha.",
    status: "Tersedia",
    created_at: "2026-10-24 11:20:00",
    views_week: 152,
    foto_motor: [
      {
        id_foto: 201,
        id_motor: 2,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBL8RUhQYdCeKqSYvGJ3xqGhoQx2oGnEwxbNgikJ1pRXLbUvtX0cWijsKyFVjdfTAgW0FAgZJ41dj0RYJ7SbBIPRu2miqs7nZq2V3Z1cBGvi3UoQwYnM-txTWEhbWSszLNwP7bIztDsn6cvAHOjbyVQVKqWNexJvzkXoyxSHlT-qETlKx90DGVARcVJmCzb3-IIjn1ZYQlTAvHWP5ZmAhs_sjfZx7NY12iyiuqH5pAw",
        label: "Tampak Depan",
        caption: "Tampak Utama Yamaha NMAX 155 Connected",
        is_utama: true,
      },
      {
        id_foto: 202,
        id_motor: 2,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAG0hEsnWSoYMN_HSKKqTAzC-5v6o3pQzdrKuQZT9cfaZZHH53ySz__Nfpn36YgsqrT3p_K3tnhk0mb_oJFfGFMjPR7X27xIopMIZd5I22IryHSIo5O8iMyuJ2o5kR6WazDvwdbKIWvdWVD8tynLnVJ-fCaGnOMUCpeX9a34oA2GUQSZa47NSRmsnarTIX0c9FB4tmkY-TMToq0EnvSmubOeNiLgYoIuvPgwGjWuUgQ",
        label: "Tampak Samping",
        caption: "Profil Bodi Samping Mulus Tanpa Goresan",
        is_utama: false,
      },
      {
        id_foto: 203,
        id_motor: 2,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
        label: "Speedometer",
        caption: "Panel Instrumen Digital Y-Connect 18.200 km",
        is_utama: false,
      },
      {
        id_foto: 204,
        id_motor: 2,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA13sV-oQ8hcjN01VGLQK8vraxl6IdCGSYmDZ3eUy61zqHPuvvM2OXxehX2jnXZulPV0QBWN9MocqqM9FqVtZixiCHjT9GP7LEf01tY02wW4MA5kzawXZhYk0hFgRezd3vxSQItUsE8pbMdDNDJd9NgEnwvrcBUAOOLAiVswznYYLMVpRys6JappAjVH5kUI41K9hbFpeCsyjbHrTdPfkAm1EvqJj-ans8l0Dg62IxU",
        label: "STNK & BPKB",
        caption: "Dokumen STNK, BPKB, & Faktur Asli Lengkap",
        is_utama: false,
      },
    ],
  },
  {
    id_motor: 3,
    id_user: 1,
    sku: "RDK-23-BEAT-DPK",
    nopol: "B 6204 TNL",
    merek: "Honda",
    tipe: "Beat Deluxe",
    tahun: 2023,
    cc: 110,
    kilometer: 8900,
    kondisi_mesin: "Sangat Baik",
    kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
    domisili_samsat: "Depok (Plat B)",
    pajak_info: "Pajak hidup s/d November 2026",
    harga_beli: 12200000,
    harga_jual: 14800000,
    harga_pasar_coret: 15500000,
    deskripsi:
      "Honda Beat Deluxe 2023 warna Matte Blue, kilometer sangat rendah 8.900 km, fitur ISS aktif, sangat irit BBM untuk mobilitas harian.",
    status: "Tersedia",
    created_at: "2026-10-23 16:50:00",
    views_week: 210,
    foto_motor: [
      {
        id_foto: 301,
        id_motor: 3,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAg-zhSydX7NhOipZzzekDtkPyTjvsPx2asSnocAYeki42wdwfv_fnnxwxT6eYJM90yhDQy5V8oy3_AQgEXPRdE3KTcVNmqVDra5lKPXZoPVIDMXipM0xF3H1VIf4JMHDpb69eXwNJvSvw89vZnKuSC5hG4Tp4Pdc0N10jpMjAY_A62qnNz8-wO1pk7pE9qr_yVjSerj9CivZ9tHRfqx9WzwX5DURpR6zetnEyguuFf",
        label: "Tampak Depan",
        caption: "Tampak Depan Honda Beat Deluxe 2023",
        is_utama: true,
      },
      {
        id_foto: 302,
        id_motor: 3,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB35HIgUm3m7vw_PtcgcMuIBgxXunyCUu0p5DdMNyaP29wdZdYuT6h5EZF56ILjP_M-XhlsX2FyIgMacJqtwdYNtJ2A40xyfO69N-WkmAYA3tdbVOuD84Z31EqdIVDALpnh3-wiDqc7LfBBtYI8uezPRu8ufwWKvZg67ZfxnS_r-WDZDrrnLjk2fOi2zwIjxLOkWMmYNe8GE2CkfX0I2W931UXiBeS6kNofAXd668qO",
        label: "Tampak Samping",
        caption: "Bodi Samping Mulus Orisinil",
        is_utama: false,
      },
      {
        id_foto: 303,
        id_motor: 3,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
        label: "Speedometer",
        caption: "Odometer Rendah 8.900 km",
        is_utama: false,
      },
      {
        id_foto: 304,
        id_motor: 3,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA13sV-oQ8hcjN01VGLQK8vraxl6IdCGSYmDZ3eUy61zqHPuvvM2OXxehX2jnXZulPV0QBWN9MocqqM9FqVtZixiCHjT9GP7LEf01tY02wW4MA5kzawXZhYk0hFgRezd3vxSQItUsE8pbMdDNDJd9NgEnwvrcBUAOOLAiVswznYYLMVpRys6JappAjVH5kUI41K9hbFpeCsyjbHrTdPfkAm1EvqJj-ans8l0Dg62IxU",
        label: "STNK & BPKB",
        caption: "Surat-Surat Lengkap STNK, BPKB, & Faktur",
        is_utama: false,
      },
    ],
  },
  {
    id_motor: 4,
    id_user: 1,
    sku: "RDK-21-AEROX-BGR",
    nopol: "B 5011 ERU",
    merek: "Yamaha",
    tipe: "Aerox 155 VVA",
    tahun: 2021,
    cc: 155,
    kilometer: 24100,
    kondisi_mesin: "Baik",
    kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
    domisili_samsat: "Bogor (Plat F)",
    pajak_info: "Pajak hidup s/d Agustus 2026",
    harga_beli: 17800000,
    harga_jual: 21900000,
    harga_pasar_coret: 22900000,
    deskripsi:
      "Yamaha Aerox 155 VVA Cyber City Livery 2021, tarikan mesin VVA sangat responsif, CVT bebas gredek, ban tubeless tapak lebar.",
    status: "Tersedia",
    created_at: "2026-10-22 09:45:00",
    views_week: 139,
    foto_motor: [
      {
        id_foto: 401,
        id_motor: 4,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDYABtwm7w8tMXJ9p9QWObgNU4JFJktjb5Qv9cx1-00qjixkXcsXgkJo8dsFCspsz-Jc__vZ4FvUYYfQwlDOmXLYTPeX0C3x0uDj-F9frDTapFxXtoDtZzem77C83REzs_GULX6PHT9eSXbWfMc1bAWGjvf1SnIdmJAJMFjlyHBbtqIfeIQqkIF3L5ALRM8lh0pEKMCw48Ak5n-zchgL_ieoZjGW33cnCqBs88YEZh-",
        label: "Tampak Depan",
        caption: "Tampak Utama Yamaha Aerox 155 VVA",
        is_utama: true,
      },
      {
        id_foto: 402,
        id_motor: 4,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBifNb0YIMGS6XW5nl4dpPUy36sWWaGD3jIA3avA54XqPoQBc_QehIxiMo9mUOxqyVZ0Oj_YVcInlIhbYdnUGFHeKDZxczmRfMau9UGnwCa5UxfDU_KL_lCVr8npbylv94WTUJkPeR6nt7OvZSZCWBXvpGjRfGZ95jPJZIz3NStIYs4MGHSbuvu3FzPQRpGybTu6KvjjlrHmtRc3QOQqXTpY-WFLXg-WgxkVJGfRNJy",
        label: "Tampak Samping",
        caption: "Profil Sporty Aerox 155 VVA",
        is_utama: false,
      },
      {
        id_foto: 403,
        id_motor: 4,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
        label: "Speedometer",
        caption: "Speedometer Full Digital 24.100 km",
        is_utama: false,
      },
      {
        id_foto: 404,
        id_motor: 4,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA13sV-oQ8hcjN01VGLQK8vraxl6IdCGSYmDZ3eUy61zqHPuvvM2OXxehX2jnXZulPV0QBWN9MocqqM9FqVtZixiCHjT9GP7LEf01tY02wW4MA5kzawXZhYk0hFgRezd3vxSQItUsE8pbMdDNDJd9NgEnwvrcBUAOOLAiVswznYYLMVpRys6JappAjVH5kUI41K9hbFpeCsyjbHrTdPfkAm1EvqJj-ans8l0Dg62IxU",
        label: "STNK & BPKB",
        caption: "Dokumen STNK & BPKB Asli",
        is_utama: false,
      },
    ],
  },
  {
    id_motor: 5,
    id_user: 1,
    sku: "RDK-22-VESPA-JKS",
    nopol: "B 3344 KLU",
    merek: "Vespa",
    tipe: "Sprint 150 I-Get ABS",
    tahun: 2022,
    cc: 150,
    kilometer: 9350,
    kondisi_mesin: "Sangat Baik",
    kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
    domisili_samsat: "Jakarta Selatan (Plat B)",
    pajak_info: "Pajak hidup s/d सितंबर 2026",
    harga_beli: 41000000,
    harga_jual: 48500000,
    harga_pasar_coret: 50500000,
    deskripsi:
      "Vespa Sprint 150 I-Get ABS 2022 warna kuning glossy favorit, kunci master coklat & biru lengkap, bodi kaleng mulus 98% orisinil.",
    status: "Tersedia",
    created_at: "2026-10-21 18:10:00",
    views_week: 245,
    foto_motor: [
      {
        id_foto: 501,
        id_motor: 5,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDPTWHIHQBY6n1o8yMs6FJlHumNalhSulA_VCQGqDyaDpz3MF2d_rSFpy7-X-j-QzJtrb_eNpvVJqkLRsWCLwX3B355_LUD3lLRmsENjc-IfDlGc2DGCI3pZ2CFyKx5PecFtEUL7OAStApNlHmHwmmMdXlVGSW4pE35U29Ic210NNqwas66Jxcvw1nLmXD1Rrw2NWIqr1STNzukTqY0sPPqU7HBShljny6RcqdJ0Skf",
        label: "Tampak Depan",
        caption: "Vespa Sprint 150 I-Get ABS 2022",
        is_utama: true,
      },
      {
        id_foto: 502,
        id_motor: 5,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAWSIYmuYM1OFsTJ0cjRZJwxY5VCVp1b6KjSEXA1GLcjVSU0wi9G7ZTlcTewMTGbJVNjxJZMF9dzStVgOmvfAqDvttlWRlrQPtDNVAxOEYIwcWRVC-IuQdVucRSf7SAFdjBjHeHMmI6qmFsWfwGRGnbYFN9oYAwcW6YhX_YpMsO1ZpcyzJCUcto6fTCgpFinEIl44YDuzLsv5DkCYmszEw0qgblOa3i5BDmDBXmjrWD",
        label: "Tampak Samping",
        caption: "Tampak Samping Vespa Sprint 150",
        is_utama: false,
      },
      {
        id_foto: 503,
        id_motor: 5,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
        label: "Speedometer",
        caption: "Odometer Rendah 9.350 km",
        is_utama: false,
      },
      {
        id_foto: 504,
        id_motor: 5,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA13sV-oQ8hcjN01VGLQK8vraxl6IdCGSYmDZ3eUy61zqHPuvvM2OXxehX2jnXZulPV0QBWN9MocqqM9FqVtZixiCHjT9GP7LEf01tY02wW4MA5kzawXZhYk0hFgRezd3vxSQItUsE8pbMdDNDJd9NgEnwvrcBUAOOLAiVswznYYLMVpRys6JappAjVH5kUI41K9hbFpeCsyjbHrTdPfkAm1EvqJj-ans8l0Dg62IxU",
        label: "STNK & BPKB",
        caption: "BPKB, STNK, Faktur, & Kunci Master Lengkap",
        is_utama: false,
      },
    ],
  },
  {
    id_motor: 6,
    id_user: 1,
    sku: "RDK-22-SCOOPY-TNG",
    nopol: "B 6104 WQE",
    merek: "Honda",
    tipe: "Scoopy Prestige",
    tahun: 2022,
    cc: 110,
    kilometer: 14120,
    kondisi_mesin: "Sangat Baik",
    kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
    domisili_samsat: "Tangerang (Plat B)",
    pajak_info: "Pajak hidup s/d Juli 2026",
    harga_beli: 15200000,
    harga_jual: 18250000,
    harga_pasar_coret: 19200000,
    deskripsi:
      "Honda Scoopy Prestige 2022 Matte White dengan jok coklat elegan, Smart Key System (Keyless), velg 12 inch ban tebal.",
    status: "Tersedia",
    created_at: "2026-10-20 15:25:00",
    views_week: 176,
    foto_motor: [
      {
        id_foto: 601,
        id_motor: 6,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCUezHR0QiZ6ace3dLWNm2F_-RydFAcvacLP96beilbXyJ8wt-deVHh8zTsqbksgiHjkxseGcJ9ZclDbngHUibHKeTUUGGnanlq9_Ub4KjUoqybyKS73N0NXEjoAV4Fr5dTkH6dsZGxIPTV8LHPhHD1M2dXPXdf__ZkfisY-FISS8XdAy4tQSLjv5kUVF9i68WM6bGhg1qaz1l08L9YUQzusrTbJ8W_mRsG_ACyJ7vl",
        label: "Tampak Depan",
        caption: "Honda Scoopy Prestige 2022 Matte White",
        is_utama: true,
      },
      {
        id_foto: 602,
        id_motor: 6,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuALsajTjxAmStq8ediYI2UaOU-d1X5FKUGQwZDISoQ0H0GMFHp-1gfM9cTriNJsyHzOutIziad7GM1usbym0YNXx7bULd5-7bOaaonFHXG252M0Pq5SFJmq9eusH2-3hEDLNFjOOMiUyY6Ewy5GglfhaHZydTH7ivr3jNSz2ZH0ML2bcI7zoQn1kIMLGgB57eM-5Q40DvPGrDUy4zadsk5oNtogevPl21TlBZHAOzrI",
        label: "Tampak Samping",
        caption: "Tampak Samping Bodi Mulus",
        is_utama: false,
      },
      {
        id_foto: 603,
        id_motor: 6,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
        label: "Speedometer",
        caption: "Odometer 14.120 km",
        is_utama: false,
      },
      {
        id_foto: 604,
        id_motor: 6,
        nama_file:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA13sV-oQ8hcjN01VGLQK8vraxl6IdCGSYmDZ3eUy61zqHPuvvM2OXxehX2jnXZulPV0QBWN9MocqqM9FqVtZixiCHjT9GP7LEf01tY02wW4MA5kzawXZhYk0hFgRezd3vxSQItUsE8pbMdDNDJd9NgEnwvrcBUAOOLAiVswznYYLMVpRys6JappAjVH5kUI41K9hbFpeCsyjbHrTdPfkAm1EvqJj-ans8l0Dg62IxU",
        label: "STNK & BPKB",
        caption: "STNK, BPKB, & Faktur Lengkap",
        is_utama: false,
      },
    ],
  },
];

export const INITIAL_PREDIKSI: PrediksiHarga[] = [
  {
    id_prediksi: 89,
    kode_prediksi: "#PRD-2026-0089",
    id_user: 1,
    id_motor: 1,
    nama_motor_katalog: "Honda Vario 160 CBS",
    nopol_katalog: "B 4819 KOX",
    kode_motor_katalog: "MTR-001",
    fitur_masukan: {
      merek: "Honda",
      tahun: 2023,
      cc: 160,
      kilometer: 12450,
      kondisi_mesin: "Sangat Baik",
      kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
      domisili_samsat: "Jakarta Selatan (Plat B)",
      harga_beli: 19500000,
    },
    harga_estimasi: 23850000,
    spread_estimasi: 450000,
    nama_model: "Random Forest Regressor v1.4",
    akurasi_r2: 94.6,
    mae_rupiah: 450000,
    rmse_rupiah: 615000,
    detail_parameter_model: "Trees: 150",
    created_at: "24 Okt 2026, 14:32 WIB",
    waktu_relatif: "4 mnt lalu",
  },
  {
    id_prediksi: 88,
    kode_prediksi: "#PRD-2026-0088",
    id_user: 1,
    id_motor: 2,
    nama_motor_katalog: "Yamaha NMAX 155 Connected",
    nopol_katalog: "B 3912 PXA",
    kode_motor_katalog: "MTR-002",
    fitur_masukan: {
      merek: "Yamaha",
      tahun: 2022,
      cc: 155,
      kilometer: 18200,
      kondisi_mesin: "Sangat Baik",
      kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
      domisili_samsat: "Depok (Plat B)",
      harga_beli: 23000000,
    },
    harga_estimasi: 27500000,
    spread_estimasi: 500000,
    nama_model: "Random Forest Regressor v1.4",
    akurasi_r2: 93.8,
    mae_rupiah: 450000,
    rmse_rupiah: 615000,
    detail_parameter_model: "Trees: 150",
    created_at: "24 Okt 2026, 11:15 WIB",
    waktu_relatif: "18 mnt lalu",
  },
  {
    id_prediksi: 87,
    kode_prediksi: "#PRD-2026-0087",
    id_user: 1,
    id_motor: null,
    catatan_simulasi: "Simulasi Tawar Lapangan",
    fitur_masukan: {
      merek: "Honda",
      tahun: 2021,
      cc: 110,
      kilometer: 31800,
      kondisi_mesin: "Baik",
      kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
      domisili_samsat: "Jakarta Timur (Plat B)",
      harga_beli: 12000000,
    },
    harga_estimasi: 14800000,
    spread_estimasi: 300000,
    nama_model: "Linear Regression",
    akurasi_r2: 89.4,
    mae_rupiah: 680000,
    rmse_rupiah: 890000,
    detail_parameter_model: "Multi-Feature OLS",
    created_at: "23 Okt 2026, 16:48 WIB",
    waktu_relatif: "42 mnt lalu",
  },
  {
    id_prediksi: 86,
    kode_prediksi: "#PRD-2026-0086",
    id_user: 1,
    id_motor: 4,
    nama_motor_katalog: "Yamaha Aerox 155 VVA",
    nopol_katalog: "B 5011 ERU",
    kode_motor_katalog: "MTR-004",
    fitur_masukan: {
      merek: "Yamaha",
      tahun: 2021,
      cc: 155,
      kilometer: 24100,
      kondisi_mesin: "Baik",
      kelengkapan_dokumen: "Lengkap (STNK + BPKB)",
      domisili_samsat: "Bogor (Plat F)",
      harga_beli: 17800000,
    },
    harga_estimasi: 21600000,
    spread_estimasi: 400000,
    nama_model: "Random Forest Regressor v1.4",
    akurasi_r2: 95.1,
    mae_rupiah: 450000,
    rmse_rupiah: 615000,
    detail_parameter_model: "Trees: 150",
    created_at: "22 Okt 2026, 09:40 WIB",
    waktu_relatif: "1 hari lalu",
  },
  {
    id_prediksi: 85,
    kode_prediksi: "#PRD-2026-0085",
    id_user: 1,
    id_motor: null,
    catatan_simulasi: "Titip Jual Konsumen",
    fitur_masukan: {
      merek: "Vespa",
      tahun: 2020,
      cc: 150,
      kilometer: 9800,
      kondisi_mesin: "Sangat Baik",
      kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
      domisili_samsat: "Jakarta Selatan (Plat B)",
      harga_beli: 37000000,
    },
    harga_estimasi: 43500000,
    spread_estimasi: 850000,
    nama_model: "Decision Tree Regressor",
    akurasi_r2: 91.2,
    mae_rupiah: 590000,
    rmse_rupiah: 810000,
    detail_parameter_model: "Max Depth: 8",
    created_at: "21 Okt 2026, 18:05 WIB",
    waktu_relatif: "2 hari lalu",
  },
  {
    id_prediksi: 84,
    kode_prediksi: "#PRD-2026-0084",
    id_user: 1,
    id_motor: 6,
    nama_motor_katalog: "Honda Scoopy Prestige",
    nopol_katalog: "B 6104 WQE",
    kode_motor_katalog: "MTR-006",
    fitur_masukan: {
      merek: "Honda",
      tahun: 2022,
      cc: 110,
      kilometer: 14120,
      kondisi_mesin: "Sangat Baik",
      kelengkapan_dokumen: "Lengkap (STNK + BPKB + Faktur)",
      domisili_samsat: "Tangerang (Plat B)",
      harga_beli: 15200000,
    },
    harga_estimasi: 18200000,
    spread_estimasi: 350000,
    nama_model: "Random Forest Regressor v1.4",
    akurasi_r2: 94.2,
    mae_rupiah: 450000,
    rmse_rupiah: 615000,
    detail_parameter_model: "Trees: 150",
    created_at: "20 Okt 2026, 15:20 WIB",
    waktu_relatif: "3 hari lalu",
  },
];

export function formatRupiah(value: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

export function formatNumberID(value: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(value));
}

export function calculateMLPrediction(
  fitur: FiturMasukanML,
  modelName:
    | "Random Forest Regressor v1.4"
    | "Linear Regression"
    | "Decision Tree Regressor" = "Random Forest Regressor v1.4"
) {
  let baseVal = fitur.harga_beli * 1.18;

  if (fitur.tahun >= 2023) baseVal += 1200000;
  else if (fitur.tahun >= 2021) baseVal += 450000;
  else baseVal -= 750000;

  if (fitur.kilometer < 15000) baseVal += 600000;
  else if (fitur.kilometer > 35000) baseVal -= 900000;

  if (fitur.kondisi_mesin.includes("Sangat Baik")) baseVal += 750000;
  else if (
    fitur.kondisi_mesin.includes("Servis") ||
    fitur.kondisi_mesin.includes("Cukup")
  )
    baseVal -= 1250000;

  if (fitur.kelengkapan_dokumen.includes("Faktur")) baseVal += 350000;
  else if (fitur.kelengkapan_dokumen.includes("Hanya STNK"))
    baseVal -= 2500000;

  if (fitur.cc >= 250) baseVal += 1500000;
  else if (fitur.cc >= 150) baseVal += 300000;

  if (modelName === "Linear Regression") {
    baseVal = baseVal * 0.985;
  } else if (modelName === "Decision Tree Regressor") {
    baseVal = baseVal * 1.012;
  }

  const estimatedPrice = Math.round(baseVal / 50000) * 50000;
  const rangeLow = Math.round((estimatedPrice * 0.965) / 50000) * 50000;
  const rangeHigh = Math.round((estimatedPrice * 1.025) / 50000) * 50000;
  const marginShowroom = estimatedPrice - fitur.harga_beli;
  const roiPct =
    fitur.harga_beli > 0
      ? Number(((marginShowroom / fitur.harga_beli) * 100).toFixed(1))
      : 0;

  const metric =
    MODEL_METRICS.find((m) => m.nama_model === modelName) ?? MODEL_METRICS[0];

  return {
    estimatedPrice,
    rangeLow,
    rangeHigh,
    marginShowroom,
    roiPct,
    r2Score: Number((metric.r2_score * 100).toFixed(1)),
    mae: metric.mae,
    rmse: metric.rmse,
    modelName: metric.nama_model,
    detailParam: metric.hyperparameter_info,
  };
}
