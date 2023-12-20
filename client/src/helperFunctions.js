import { secp256k1 as secp } from "ethereum-cryptography/secp256k1.js";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak";

export async function signMessage(message, privKey) {
  return secp.sign(keccak256(utf8ToBytes(message)), privKey);
}

export function getAddress(publicKey) {
  const slicedPublicKeyHash = keccak256(publicKey.slice(1));
  return "0x" + toHex(slicedPublicKeyHash.slice(-20));
}

export function calculateAddressFromPrivateKey(privKey) {
    if (privKey) {
      const publicKey = secp.getPublicKey(privKey);
      return getAddress(publicKey);
    }
}

export function serializeSignature(signature) {
  return JSON.stringify(signature, function (_, value) {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}
