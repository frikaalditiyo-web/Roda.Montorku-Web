import { predictPrice } from "@/lib/mlEngine";
import type { Motor } from "@/data/mockShowroomData";

export interface PublicMotorEstimate {
  rangeLow: number;
  rangeHigh: number;
  r2Score: number;
}

export type SerializedMotor = Omit<Motor, "harga_beli" | "id_user"> & {
  id_user?: number;
  harga_beli?: number;
  estimasi_pasar: PublicMotorEstimate;
};

/**
 * Strip sensitive acquisition pricing (`harga_beli`) and internal owner ID
 * for unauthenticated catalog visitors while providing precomputed ML market bounds.
 */
export function serializeMotorForViewer(
  motor: Motor,
  isAdmin: boolean
): SerializedMotor {
  const purchasePrice = Number(motor.harga_beli || motor.harga_jual || 1000000);
  const ml = predictPrice({
    merek: motor.merek,
    tahun: motor.tahun,
    cc: motor.cc,
    kilometer: motor.kilometer,
    kondisi_mesin: motor.kondisi_mesin,
    kelengkapan_dokumen: motor.kelengkapan_dokumen,
    domisili_samsat: motor.domisili_samsat,
    harga_beli: purchasePrice,
  });

  const estimasi_pasar: PublicMotorEstimate = {
    rangeLow: ml.rangeLow,
    rangeHigh: ml.rangeHigh,
    r2Score: ml.r2Score,
  };

  if (isAdmin) {
    return {
      ...motor,
      estimasi_pasar,
    };
  }

  const { harga_beli: _hb, id_user: _uid, ...publicFields } = motor;
  void _hb;
  void _uid;

  return {
    ...publicFields,
    estimasi_pasar,
  };
}
