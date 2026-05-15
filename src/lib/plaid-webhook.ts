import jwt from 'jsonwebtoken'
import { plaid } from './plaid'
import crypto from 'crypto'

/**
 * Plaid webhook verification state — the verification key is cached
 * for its lifetime (typically 1 hour per Plaid's key rotation policy).
 * Re-fetched automatically when the `kid` changes.
 */
const keyCache = new Map<string, crypto.KeyObject>()

/**
 * Verify a Plaid webhook JWT from the `plaid-verification` header.
 *
 * Plaid signs every webhook with ES256 (ECDSA P-256) and includes
 * the JWT in the `plaid-verification` header. The signing key's
 * `kid` is in the JWT header; we fetch the JWK from Plaid's API,
 * convert it to a PEM public key, and verify the signature.
 *
 * Returns `true` if the signature is valid, `false` otherwise.
 */
export async function verifyPlaidWebhook(
  plaidVerificationJwt: string
): Promise<boolean> {
  try {
    // 1. Decode JWT header to extract the key ID (kid)
    const decoded = jwt.decode(plaidVerificationJwt, { complete: true })
    if (!decoded || typeof decoded !== 'object' || !decoded.header?.kid) {
      return false
    }

    const kid = decoded.header.kid as string

    // 2. Get or fetch the verification key
    let publicKey = keyCache.get(kid)
    if (!publicKey) {
      const response = await plaid.webhookVerificationKeyGet({ key_id: kid })
      const jwk = response.data.key
      if (!jwk) return false

      // Plaid uses ES256 → P-256 (secp256r1) EC key
      publicKey = crypto.createPublicKey({
        format: 'jwk',
        key: {
          kty: jwk.kty,
          crv: jwk.crv,
          x: jwk.x,
          y: jwk.y,
        } as crypto.JsonWebKey,
      })

      keyCache.set(kid, publicKey)
    }

    // 3. Convert to PEM for jsonwebtoken
    const pem = publicKey.export({ format: 'pem', type: 'spki' }) as string

    // 4. Verify the JWT signature
    const verified = jwt.verify(plaidVerificationJwt, pem, {
      algorithms: ['ES256'],
    })

    return !!verified
  } catch {
    return false
  }
}

/**
 * Clear the verification key cache. Useful in tests or if you suspect
 * key rotation without a `kid` change.
 */
export function clearPlaidWebhookKeyCache() {
  keyCache.clear()
}
