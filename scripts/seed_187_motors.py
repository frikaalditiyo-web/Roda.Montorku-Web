import zipfile
import io
import json
import os
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

BRAND_PHOTOS = {
    "Honda": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCeKZ6MHGP-odobRcjSN-aeaH9mdtyoJ2dn65ZX8HrTay_V4JYgDcoX7_cTXUtpRTXniFBvA2DgZTwfGUbsSgVfjvZBSy1eNHF-33AoMDkL4U7opyMGLYO3RRVpmeZqB--q3mKZ7FZeJQtqr1gXZHRoypMyY-oaHFKsEbdnP4Gfu7468vat38VLiJg6DpwAhwOFbmTsG0SnvrNrDYc1WyDUxizFwV8CsMwX3aiigg6F",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMsI9k2qZ58VV6Dd8AfOC5KpKWxTp1oJEkPIUiODzIxgwaECsFXmfaZK_x-qKRQ_yOi_cwhYx0JbHbEVr_UwTxF9zg7GqeGMtm4bf98i8XdzScE-NukMEfrgeVcm9FXxozwkUP7fS5VnMDqq9SE6naq4SUR1hJ8jSBCtil7m9-g_pxPVb6ABWojASQMTW_tECU5Hp6N25hNugOTmkJdk6IMt-YmQLs2GKpU15Uvt1s",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
    ],
    "Yamaha": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBL8RUhQYdCeKqSYvGJ3xqGhoQx2oGnEwxbNgikJ1pRXLbUvtX0cWijsKyFVjdfTAgW0FAgZJ41dj0RYJ7SbBIPRu2miqs7nZq2V3Z1cBGvi3UoQwYnM-txTWEhbWSszLNwP7bIztDsn6cvAHOjbyVQVKqWNexJvzkXoyxSHlT-qETlKx90DGVARcVJmCzb3-IIjn1ZYQlTAvHWP5ZmAhs_sjfZx7NY12iyiuqH5pAw",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAG0hEsnWSoYMN_HSKKqTAzC-5v6o3pQzdrKuQZT9cfaZZHH53ySz__Nfpn36YgsqrT3p_K3tnhk0mb_oJFfGFMjPR7X27xIopMIZd5I22IryHSIo5O8iMyuJ2o5kR6WazDvwdbKIWvdWVD8tynLnVJ-fCaGnOMUCpeX9a34oA2GUQSZa47NSRmsnarTIX0c9FB4tmkY-TMToq0EnvSmubOeNiLgYoIuvPgwGjWuUgQ",
    ],
    "Vespa": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB35HIgUm3m7vw_PtcgcMuIBgxXunyCUu0p5DdMNyaP29wdZdYuT6h5EZF56ILjP_M-XhlsX2FyIgMacJqtwdYNtJ2A40xyfO69N-WkmAYA3tdbVOuD84Z31EqdIVDALpnh3-wiDqc7LfBBtYI8uezPRu8ufwWKvZg67ZfxnS_r-WDZDrrnLjk2fOi2zwIjxLOkWMmYNe8GE2CkfX0I2W931UXiBeS6kNofAXd668qO",
    ],
    "Suzuki": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAg-zhSydX7NhOipZzzekDtkPyTjvsPx2asSnocAYeki42wdwfv_fnnxwxT6eYJM90yhDQy5V8oy3_AQgEXPRdE3KTcVNmqVDra5lKPXZoPVIDMXipM0xF3H1VIf4JMHDpb69eXwNJvSvw89vZnKuSC5hG4Tp4Pdc0N10jpMjAY_A62qnNz8-wO1pk7pE9qr_yVjSerj9CivZ9tHRfqx9WzwX5DURpR6zetnEyguuFf",
    ],
    "Kawasaki": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBL8RUhQYdCeKqSYvGJ3xqGhoQx2oGnEwxbNgikJ1pRXLbUvtX0cWijsKyFVjdfTAgW0FAgZJ41dj0RYJ7SbBIPRu2miqs7nZq2V3Z1cBGvi3UoQwYnM-txTWEhbWSszLNwP7bIztDsn6cvAHOjbyVQVKqWNexJvzkXoyxSHlT-qETlKx90DGVARcVJmCzb3-IIjn1ZYQlTAvHWP5ZmAhs_sjfZx7NY12iyiuqH5pAw",
    ],
}

def parse_xlsx():
    with zipfile.ZipFile('dataset_motor_bekas_187-v2.zip', 'r') as outer_zip:
        xlsx_bytes = outer_zip.read('dataset_motor_bekas_187-v2.xlsx')

    with zipfile.ZipFile(io.BytesIO(xlsx_bytes), 'r') as xz:
        # 1. Parse shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in xz.namelist():
            ss_tree = ET.fromstring(xz.read('xl/sharedStrings.xml'))
            ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for si in ss_tree.findall('main:si', ns):
                t = si.find('main:t', ns)
                shared_strings.append(t.text if t is not None and t.text is not None else '')

        # 2. Parse sheet1
        sheet_tree = ET.fromstring(xz.read('xl/worksheets/sheet1.xml'))
        ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        rows = []
        sheet_data = sheet_tree.find('main:sheetData', ns)
        for row in sheet_data.findall('main:row', ns):
            row_dict = {}
            for c in row.findall('main:c', ns):
                ref = c.attrib.get('r', '')
                col = ''.join(filter(str.isalpha, ref))
                t_attr = c.attrib.get('t')
                v_el = c.find('main:v', ns)
                val = v_el.text if v_el is not None else ''
                if t_attr == 's' and val.isdigit():
                    idx = int(val)
                    val = shared_strings[idx] if idx < len(shared_strings) else val
                row_dict[col] = val
            rows.append(row_dict)

    return rows

def generate_motors(raw_rows):
    header = raw_rows[0]
    data_rows = raw_rows[1:]
    
    print(f"Total raw data rows: {len(data_rows)}")
    
    motors = []
    base_time = datetime(2026, 2, 1, 10, 0, 0)
    
    for idx, r in enumerate(data_rows):
        id_motor = idx + 1
        nama = r.get('B', 'Motor Bekas').strip()
        merek = r.get('C', 'Honda').strip()
        tahun = int(r.get('D', 2020))
        kelengkapan_raw = r.get('E', 'stnk bpkb').strip().lower()
        kilometer = int(float(r.get('F', 20000)))
        harga_beli = int(float(r.get('G', 12000000)))
        kondisi_mesin = r.get('H', 'Baik').strip()
        domisili_samsat = r.get('I', 'Nganjuk (AG)').strip()
        cc = int(float(r.get('J', 125)))
        harga_jual = int(float(r.get('K', harga_beli * 1.15)))

        # Normalize merek
        if merek not in ["Honda", "Yamaha", "Vespa", "Suzuki", "Kawasaki"]:
            merek_map = {"honda": "Honda", "yamaha": "Yamaha", "vespa": "Vespa", "suzuki": "Suzuki", "kawasaki": "Kawasaki"}
            merek = merek_map.get(merek.lower(), "Honda")

        # Document label
        if "stnk" in kelengkapan_raw and "bpkb" in kelengkapan_raw:
            kelengkapan_dokumen = "Lengkap (STNK + BPKB)"
        elif "bpkb" in kelengkapan_raw:
            kelengkapan_dokumen = "Hanya BPKB"
        elif "stnk" in kelengkapan_raw:
            kelengkapan_dokumen = "Hanya STNK"
        else:
            kelengkapan_dokumen = kelengkapan_raw.title()

        # Status: 165 Tersedia, rest Terjual
        status = "Tersedia" if idx < 165 else "Terjual"
        
        # Nopol with real Jatim / Samsat format
        samsat_lower = domisili_samsat.lower()
        if "malang" in samsat_lower:
            plat_prefix = "N"
        elif "surabaya" in samsat_lower:
            plat_prefix = "L"
        elif "sidoarjo" in samsat_lower:
            plat_prefix = "W"
        else:
            plat_prefix = "AG"
            
        nomor_plat = f"{plat_prefix} {1000 + (idx * 37) % 8999} {chr(65 + (idx % 26))}{chr(65 + ((idx * 5) % 26))}"
        sku = f"RDK-{str(tahun)[-2:]}-{merek[:3].upper()}-{id_motor:03d}"
        
        # Photos
        brand_photo_list = BRAND_PHOTOS.get(merek, BRAND_PHOTOS["Honda"])
        photo_url = brand_photo_list[idx % len(brand_photo_list)]
        
        margin = harga_jual - harga_beli
        harga_coret = int(round((harga_jual * 1.05) / 50000.0) * 50000)
        created_dt = base_time - timedelta(hours=idx * 6)
        
        motor = {
            "id_motor": id_motor,
            "id_user": 1,
            "sku": sku,
            "nopol": nomor_plat,
            "merek": merek,
            "tipe": nama,
            "tahun": tahun,
            "cc": cc,
            "kilometer": kilometer,
            "kondisi_mesin": kondisi_mesin,
            "kelengkapan_dokumen": kelengkapan_dokumen,
            "domisili_samsat": domisili_samsat,
            "pajak_info": "Pajak hidup aktif",
            "harga_beli": harga_beli,
            "harga_jual": harga_jual,
            "harga_pasar_coret": harga_coret,
            "deskripsi": f"Unit showroom {merek} {nama} tahun {tahun}. Mesin {kondisi_mesin}, jarak tempuh {kilometer:,} km, kelengkapan {kelengkapan_dokumen}, Samsat {domisili_samsat}. Lolos inspeksi 120+ titik, siap pakai bergaransi showroom Roda.Motorku.",
            "status": status,
            "created_at": created_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "views_week": 35 + (idx * 7) % 180,
            "foto_motor": [
                {
                    "id_foto": id_motor * 10 + 1,
                    "id_motor": id_motor,
                    "nama_file": photo_url,
                    "label": "Tampak Depan",
                    "caption": f"Tampak Depan {merek} {nama}",
                    "is_utama": True
                }
            ]
        }
        motors.append(motor)

    return motors

def main():
    raw_rows = parse_xlsx()
    motors = generate_motors(raw_rows)
    print(f"Generated {len(motors)} motor records from dataset.")

    # 1. Save to src/data/dataset_motors.json
    out_json = "src/data/dataset_motors.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(motors, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(motors)} motors to {out_json}")

    # 2. Update src/data/db_store.json
    store_file = "src/data/db_store.json"
    store_data = {"users": [], "motors": [], "predictions": []}
    if os.path.exists(store_file):
        with open(store_file, "r", encoding="utf-8") as f:
            store_data = json.load(f)
    
    store_data["motors"] = motors
    with open(store_file, "w", encoding="utf-8") as f:
        json.dump(store_data, f, indent=2, ensure_ascii=False)
    print(f"Updated {store_file} with {len(motors)} motors.")

if __name__ == "__main__":
    main()
