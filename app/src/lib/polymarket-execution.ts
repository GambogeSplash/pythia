/* ------------------------------------------------------------------ */
/*  Polymarket CLOB Order Execution                                    */
/*  Builds, signs, and submits orders to the Polymarket CLOB API       */
/*  Reference: https://docs.polymarket.com                             */
/* ------------------------------------------------------------------ */

const CLOB_BASE = "https://clob.polymarket.com";

/* Polymarket uses Polygon (chain ID 137) */
const POLYGON_CHAIN_ID = 137;

/* Exchange contract on Polygon */
const EXCHANGE_ADDRESS = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";

/* ── Types ── */

export type OrderSide = "BUY" | "SELL";

export interface OrderParams {
  /** Polymarket market ID (from Gamma API) */
  marketId: string;
  /** CLOB token ID for the specific outcome (Yes/No) */
  tokenId: string;
  /** BUY or SELL */
  side: OrderSide;
  /** Amount in USDC (e.g. "10.00") */
  amount: string;
  /** Price per share (0-1, e.g. "0.65" = 65 cents) */
  price: string;
}

export interface ClobOrder {
  /** Unique salt for the order */
  salt: string;
  /** The address of the order maker */
  maker: string;
  /** The address of the signer (usually same as maker) */
  signer: string;
  /** Address of the exchange contract */
  taker: string;
  /** Token ID being traded */
  tokenId: string;
  /** Maker amount in base units */
  makerAmount: string;
  /** Taker amount in base units */
  takerAmount: string;
  /** Order expiration timestamp (0 = no expiry) */
  expiration: string;
  /** Nonce for replay protection */
  nonce: string;
  /** Fee rate in basis points */
  feeRateBps: string;
  /** Side: 0 = BUY, 1 = SELL */
  side: number;
  /** Signature type: 0 = EOA, 1 = POLY_PROXY, 2 = POLY_GNOSIS_SAFE */
  signatureType: number;
}

export interface SignedClobOrder extends ClobOrder {
  signature: string;
}

export interface OrderResponse {
  success: boolean;
  orderID?: string;
  errorMsg?: string;
  transactionsHashes?: string[];
}

export interface ApiCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
}

/* ── EIP-712 Types for Polymarket Order Signing ── */

const EIP712_DOMAIN = {
  name: "Polymarket CTF Exchange",
  version: "1",
  chainId: POLYGON_CHAIN_ID,
  verifyingContract: EXCHANGE_ADDRESS,
} as const;

const ORDER_TYPES = {
  Order: [
    { name: "salt", type: "uint256" },
    { name: "maker", type: "address" },
    { name: "signer", type: "address" },
    { name: "taker", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "makerAmount", type: "uint256" },
    { name: "takerAmount", type: "uint256" },
    { name: "expiration", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "feeRateBps", type: "uint256" },
    { name: "side", type: "uint8" },
    { name: "signatureType", type: "uint8" },
  ],
} as const;

/* ── Helpers ── */

function generateSalt(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return BigInt(
    "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  ).toString();
}

/**
 * Convert a human-readable amount + price into on-chain base units.
 * USDC has 6 decimals. Outcome tokens have 6 decimals on Polymarket.
 */
function toBaseUnits(amount: string, decimals: number = 6): string {
  const [whole, frac = ""] = amount.split(".");
  const paddedFrac = frac.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFrac).toString();
}

/* ── Order Building ── */

/**
 * Build a CLOB order structure ready for signing.
 *
 * @param params - Order parameters (marketId, tokenId, side, amount, price)
 * @param makerAddress - The wallet address placing the order
 * @returns Unsigned ClobOrder
 */
export function buildOrder(
  params: OrderParams,
  makerAddress: string
): ClobOrder {
  const { tokenId, side, amount, price } = params;

  // Calculate maker/taker amounts based on side
  // BUY: maker pays USDC (makerAmount), receives outcome tokens (takerAmount)
  // SELL: maker pays outcome tokens (makerAmount), receives USDC (takerAmount)
  const priceNum = parseFloat(price);
  const amountNum = parseFloat(amount);

  let makerAmount: string;
  let takerAmount: string;

  if (side === "BUY") {
    // Paying USDC: cost = amount * price
    const cost = (amountNum * priceNum).toFixed(6);
    makerAmount = toBaseUnits(cost);
    takerAmount = toBaseUnits(amount);
  } else {
    // Selling outcome tokens, receiving USDC
    makerAmount = toBaseUnits(amount);
    const proceeds = (amountNum * priceNum).toFixed(6);
    takerAmount = toBaseUnits(proceeds);
  }

  return {
    salt: generateSalt(),
    maker: makerAddress,
    signer: makerAddress,
    taker: "0x0000000000000000000000000000000000000000", // open order (any taker)
    tokenId,
    makerAmount,
    takerAmount,
    expiration: "0", // no expiry
    nonce: "0",
    feeRateBps: "0",
    side: side === "BUY" ? 0 : 1,
    signatureType: 0, // EOA
  };
}

/* ── Order Signing ── */

/**
 * Sign a CLOB order using EIP-712 typed data signing.
 * Requires an ethers.js v6 Signer (e.g., from BrowserProvider).
 *
 * @param order - The unsigned ClobOrder
 * @param signer - An ethers.js v6 Signer instance
 * @returns Signed order with signature attached
 *
 * Usage:
 * ```ts
 * import { BrowserProvider } from "ethers";
 * const provider = new BrowserProvider(window.ethereum);
 * const signer = await provider.getSigner();
 * const signed = await signOrder(order, signer);
 * ```
 */
export async function signOrder(
  order: ClobOrder,
  signer: {
    signTypedData: (
      domain: Record<string, unknown>,
      types: Record<string, Array<{ name: string; type: string }>>,
      value: Record<string, unknown>
    ) => Promise<string>;
  }
): Promise<SignedClobOrder> {
  // TODO: For production, import { TypedDataDomain } from "ethers" and validate
  // that the signer is connected to the correct chain (Polygon 137).

  const signature = await signer.signTypedData(
    EIP712_DOMAIN as unknown as Record<string, unknown>,
    ORDER_TYPES as unknown as Record<
      string,
      Array<{ name: string; type: string }>
    >,
    order as unknown as Record<string, unknown>
  );

  return { ...order, signature };
}

/* ── Order Execution ── */

/**
 * Submit a signed order to the Polymarket CLOB API.
 *
 * @param signedOrder - The signed CLOB order
 * @param credentials - API credentials (apiKey, apiSecret, passphrase)
 * @returns Order response with orderID or error
 */
export async function executeOrder(
  signedOrder: SignedClobOrder,
  credentials: ApiCredentials
): Promise<OrderResponse> {
  const body = {
    order: signedOrder,
    owner: signedOrder.maker,
    orderType: "GTC", // Good-Til-Cancelled
  };

  try {
    const res = await fetch(`${CLOB_BASE}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Polymarket CLOB uses API key auth with HMAC signatures
        "POLY_API_KEY": credentials.apiKey,
        "POLY_PASSPHRASE": credentials.passphrase,
        "POLY_TIMESTAMP": Math.floor(Date.now() / 1000).toString(),
        "POLY_SIGNATURE": await generateApiSignature(
          credentials.apiSecret,
          "POST",
          "/order",
          JSON.stringify(body)
        ),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        success: false,
        errorMsg: `CLOB API error ${res.status}: ${errBody}`,
      };
    }

    const data = (await res.json()) as {
      orderID?: string;
      transactionsHashes?: string[];
    };

    return {
      success: true,
      orderID: data.orderID,
      transactionsHashes: data.transactionsHashes,
    };
  } catch (err) {
    return {
      success: false,
      errorMsg:
        err instanceof Error ? err.message : "Failed to submit order",
    };
  }
}

/* ── API Key Derivation ── */

/**
 * Derive Polymarket CLOB API credentials from a wallet signature.
 * Polymarket derives API keys by having the user sign a specific message,
 * then using that signature to create deterministic credentials.
 *
 * @param signer - An ethers.js v6 Signer
 * @returns API credentials (apiKey, apiSecret, passphrase)
 *
 * TODO: The actual derivation uses the Polymarket SDK's `deriveApiKey()`.
 * This requires signing a specific nonce message and calling the
 * `/auth/derive-api-key` endpoint. Install `@polymarket/clob-client`
 * for the full implementation:
 *
 * ```ts
 * import { ClobClient } from "@polymarket/clob-client";
 * const client = new ClobClient(CLOB_BASE, POLYGON_CHAIN_ID, signer);
 * const creds = await client.createOrDeriveApiKey();
 * ```
 */
export async function deriveApiCredentials(signer: {
  signMessage: (message: string) => Promise<string>;
  getAddress: () => Promise<string>;
}): Promise<ApiCredentials> {
  const address = await signer.getAddress();

  // Step 1: Request a nonce from the CLOB API
  const nonceRes = await fetch(`${CLOB_BASE}/auth/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!nonceRes.ok) {
    throw new Error(`Failed to get auth nonce: ${nonceRes.status}`);
  }

  const { nonce } = (await nonceRes.json()) as { nonce: string };

  // Step 2: Sign the nonce message
  const signature = await signer.signMessage(nonce);

  // Step 3: Derive API key from signature
  const deriveRes = await fetch(`${CLOB_BASE}/auth/derive-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature, nonce }),
  });

  if (!deriveRes.ok) {
    throw new Error(`Failed to derive API key: ${deriveRes.status}`);
  }

  const creds = (await deriveRes.json()) as ApiCredentials;
  return creds;
}

/* ── HMAC Signature for API Auth ── */

/**
 * Generate HMAC-SHA256 signature for CLOB API authentication.
 * The Polymarket CLOB uses this to verify API requests.
 */
async function generateApiSignature(
  apiSecret: string,
  method: string,
  path: string,
  body: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = timestamp + method + path + body;

  // Use Web Crypto API for HMAC
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return btoa(String.fromCharCode(...hashArray));
}

/* ── Cancel Order ── */

/**
 * Cancel an existing order on the Polymarket CLOB.
 */
export async function cancelOrder(
  orderId: string,
  credentials: ApiCredentials
): Promise<{ success: boolean; errorMsg?: string }> {
  try {
    const body = JSON.stringify({ orderID: orderId });

    const res = await fetch(`${CLOB_BASE}/order/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "POLY_API_KEY": credentials.apiKey,
        "POLY_PASSPHRASE": credentials.passphrase,
        "POLY_TIMESTAMP": Math.floor(Date.now() / 1000).toString(),
        "POLY_SIGNATURE": await generateApiSignature(
          credentials.apiSecret,
          "DELETE",
          `/order/${orderId}`,
          body
        ),
      },
      body,
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        success: false,
        errorMsg: `Cancel failed ${res.status}: ${errBody}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      errorMsg:
        err instanceof Error ? err.message : "Failed to cancel order",
    };
  }
}

/* ── Get Open Orders ── */

/**
 * Fetch open orders for the connected wallet.
 */
export async function getOpenOrders(
  credentials: ApiCredentials
): Promise<SignedClobOrder[]> {
  const res = await fetch(`${CLOB_BASE}/orders`, {
    method: "GET",
    headers: {
      "POLY_API_KEY": credentials.apiKey,
      "POLY_PASSPHRASE": credentials.passphrase,
      "POLY_TIMESTAMP": Math.floor(Date.now() / 1000).toString(),
      "POLY_SIGNATURE": await generateApiSignature(
        credentials.apiSecret,
        "GET",
        "/orders",
        ""
      ),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }

  return (await res.json()) as SignedClobOrder[];
}
