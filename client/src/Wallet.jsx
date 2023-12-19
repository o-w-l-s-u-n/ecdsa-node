import server from "./server";
import { secp256k1 as secp } from "ethereum-cryptography/secp256k1.js";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils.js";
import { useCallback, useEffect } from "react";
import { keccak256 } from "ethereum-cryptography/keccak";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  accRegStep,
  setAccRegStep,
}) {
  async function authorize(privKey) {
    const message = self.crypto.randomUUID().toString();
    if (privKey) {
    } else {
      const newPrivateKey = secp.utils.randomPrivateKey();
      const publicKey = secp.getPublicKey(newPrivateKey);
      const signature = await signMessage(message, newPrivateKey);
    }
  }

  function serializeSignature(signature){
    return JSON.stringify(signature, function(_, value){
      if(typeof(value) === 'bigint'){
        return value.toString()
      }
      return value
    })
  }

  async function requestBallance() {
    const message = self.crypto.randomUUID().toString();
    const signature = await signMessage(message, privateKey);
    try {
      if (address) {
        const {
          data: { balance },
        } = await server.post(
          `balance/${calculateAddressFromPivateKey(privateKey)}`, {
            message: message,
            signature: serializeSignature(signature),
            publicKey: secp.getPublicKey(privateKey)
          }
        );
        setBalance(balance);
      } else {
        setBalance(0);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    // if (address) {
    //   const {
    //     data: { balance },
    //   } = await server.get(`balance/${address}`);
    //   setBalance(balance);
    // } else {
    //   setBalance(0);
    // }
  }

  function calculateAddressFromPivateKey(privKey) {
    if(typeof(privKey) === 'string') privKey = utf8ToBytes(privKey);
    const publicKey = secp.getPublicKey(privKey);
    return getAddress(publicKey);
  }

  function handlePrivateKeyChange(e) {
    setPrivateKey(e.target.value);
  }

  async function signMessage(message, privKey) {
    return secp.sign(keccak256(utf8ToBytes(message)), privKey);
  }

  function getAddress(publicKey) {
    const slicedPublicKeyHash = keccak256(publicKey.slice(1));
    return "0x" + toHex(slicedPublicKeyHash.slice(-20));
  }

  async function handleCreateWalletClick() {
    setAccRegStep(true);
    const newPrivateKey = secp.utils.randomPrivateKey();
    const publicKey = secp.getPublicKey(newPrivateKey);
    console.log(publicKey);
    const address = getAddress(publicKey);
    const message = self.crypto.randomUUID().toString();
    console.log(message);
    const signature = await signMessage(message, newPrivateKey);

    let serializedSignature = serializeSignature(signature)

    try {
      const response = await server.post(`create`, {
        message: message,
        signature: serializedSignature,
        publicKey: publicKey,
        timestamp: Date.now(),
      });
      console.log(response);
    } catch (err) {
      console.error(err);
    } finally {
      setAddress(address);
      setPrivateKey(newPrivateKey);
    }
  }

  function displayPrivateKey() {
    return (
      <label>
        Your private key: (copy and save it)
        <textarea value={toHex(privateKey)} readOnly rows={3} />
        Your wallet address:
        <textarea readOnly rows={3} value={address} />
      </label>
    );
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address}
          onChange={onChange}
        ></input>
      </label>
      <button onClick={requestBallance}>Update balance</button>
      <label>
        Your private key
        <input
          placeholder="Type your private key for the address"
          value={privateKey && toHex(privateKey)}
          onChange={handlePrivateKeyChange}
        ></input>
      </label>
      <div className="balance">Balance: {balance}</div>
      <label>
        or
        <input
          type="submit"
          className="button"
          value="Create wallet"
          onClick={handleCreateWalletClick}
        />
        {accRegStep && privateKey && displayPrivateKey()}
      </label>
    </div>
  );
}

export default Wallet;
