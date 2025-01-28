import { decodeBase64, encodeBase64, encodeBase64Url } from "./base64";

/**
 * Google OAuth2.0認証を行うクラス
 * @see {@link https://developers.google.com/identity/protocols/oauth2}
 */
export class GoogleAuth {
  private readonly clientEmail: string;
  private readonly privateKey: string;
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(clientEmail: string, privateKey: string) {
    this.clientEmail = clientEmail;
    this.privateKey = privateKey.replace(/\\n/g, "\n");
  }

  async getAccessToken(): Promise<string> {
    // トークンが有効な場合は再利用
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    // JWTの作成
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1時間後

    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const claim = {
      iss: this.clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: expiry,
      iat: now,
    };

    try {
      // Base64エンコード
      const encodedHeader = encodeBase64Url(header);
      const encodedClaim = encodeBase64Url(claim);

      // 署名の作成
      const signatureInput = `${encodedHeader}.${encodedClaim}`;
      const key = await this.importPrivateKey();
      const signature = await this.signContent(signatureInput, key);

      // JWTの組み立て
      const jwt = `${encodedHeader}.${encodedClaim}.${signature}`;

      // アクセストークンの取得
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get access token");
      }

      const data: {
        access_token: string;
        expires_in: number;
      } = await response.json();
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      return this.token;
    } catch (err) {
      console.error("getAccessToken error:", err);
      throw err;
    }
  }

  private async importPrivateKey(): Promise<CryptoKey> {
    // PEM形式から秘密鍵を抽出
    const pemContent = this.privateKey
      .trim()
      .split(/[\r\n]+/)
      .map((line) => line.trim())
      .filter(
        (line) =>
          !line.startsWith("-----BEGIN") && !line.startsWith("-----END"),
      )
      .join("");

    try {
      // Base64デコード
      const binaryDer = decodeBase64(pemContent);

      // PKCS8形式の秘密鍵をインポート
      return await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" },
        },
        false,
        ["sign"],
      );
    } catch (err) {
      console.error("Private key import error:", err);
      console.error("PEM content length:", this.privateKey.length);
      throw err;
    }
  }

  private async signContent(content: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    try {
      const signature = await crypto.subtle.sign(
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" },
        },
        key,
        data,
      );

      return encodeBase64(signature);
    } catch (err) {
      console.error("Content signing error:", err);
      throw err;
    }
  }
}
