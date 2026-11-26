import { NextRequest } from "next/server";
import { GET as getPrediksi, POST as postPrediksi } from "../prediksi/route";

// Alias route for /api/predict (English convention referenced in Proposal Bab III)
export async function GET(request: NextRequest) {
  return getPrediksi(request);
}

export async function POST(request: NextRequest) {
  return postPrediksi(request);
}
