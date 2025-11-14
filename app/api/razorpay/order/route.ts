import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/server";
import type { CoinRewardConfig } from "@/lib/rewards";
import { defaultCoinRewardConfig } from "@/lib/rewards";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
};

export async function POST(request: Request) {
  try {
    const { coins } = (await request.json()) as { coins?: number };
    if (typeof coins !== "number" || !Number.isFinite(coins) || coins <= 0) {
      return NextResponse.json({ error: "Invalid coin amount" }, { status: 400 });
    }

    const firestore = getAdminFirestore();
    const snapshot = await firestore.doc("config/coinRewards").get();
    const config = (snapshot.data() as CoinRewardConfig | undefined) ?? defaultCoinRewardConfig;
    const minCoins = config.cashout.minCoins ?? defaultCoinRewardConfig.cashout.minCoins;

    if (coins < minCoins) {
      return NextResponse.json(
        { error: `Minimum cashout is ${minCoins} coins` },
        { status: 400 }
      );
    }

    const exchangeRate = config.cashout.exchangeRate ?? defaultCoinRewardConfig.cashout.exchangeRate;
    const currency = config.cashout.currency ?? defaultCoinRewardConfig.cashout.currency;
    const amount = Math.round(coins * exchangeRate * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Cashout amount is below the gateway threshold" }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json({ error: "Razorpay configuration missing" }, { status: 503 });
    }

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${razorpay.keyId}:${razorpay.keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `vault-${Date.now()}`,
        notes: { coins }
      })
    });

    if (!orderResponse.ok) {
      const errorBody = await orderResponse.text();
      console.error("Razorpay order creation failed", orderResponse.status, errorBody);
      return NextResponse.json({ error: "Razorpay order creation failed" }, { status: 502 });
    }

    const order = await orderResponse.json();

    return NextResponse.json({ order, keyId: razorpay.keyId, coins });
  } catch (error) {
    console.error("Failed to create Razorpay order", error);
    return NextResponse.json({ error: "Unable to create Razorpay order" }, { status: 500 });
  }
}
