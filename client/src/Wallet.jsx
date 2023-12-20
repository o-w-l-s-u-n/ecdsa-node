import server from "./server";
import { secp256k1 as secp } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { useEffect } from "react";
import {
  signMessage,
  getAddress,
  calculateAddressFromPrivateKey,
  serializeSignature,
} from "./helperFunctions";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  accRegStep,
  setAccRegStep,
  setPrivKeyError,
  privKeyError,
}) {
  async function requestBallance() {
    if (privateKey) {
      const message = self.crypto.randomUUID().toString();
      const signature = await signMessage(message, privateKey);
      console.log(privateKey);
      try {
        if (address) {
          const {
            data: { balance },
          } = await server.post(`balance/${address}`, {
            message: message,
            signature: serializeSignature(signature),
            publicKey: secp.getPublicKey(privateKey),
          });
          setBalance(balance);
        } else {
          setBalance(0);
        }
      } catch (err) {
        console.error(err);
      }
    } else alert("Enter your private key");
  }

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
  }

  function handlePrivateKeyChange(e) {
    setPrivateKey(e.target.value);
  }

  useEffect(() => {
    try {
      const address = calculateAddressFromPrivateKey(privateKey);
      console.log('address: ', address )
      setAddress(address);
      setPrivKeyError(false);
    } catch (err) {
      setPrivKeyError(true);
    }
  }, [privateKey]);

  async function handleCreateWalletClick() {
    setAccRegStep(true);
    const newPrivateKey = toHex(secp.utils.randomPrivateKey());
    const publicKey = secp.getPublicKey(newPrivateKey);
    console.log(publicKey);
    const address = getAddress(publicKey);
    const message = self.crypto.randomUUID().toString();
    console.log(message);
    const signature = await signMessage(message, newPrivateKey);

    let serializedSignature = serializeSignature(signature);
    let response;
    try {
      response = await server.post(`create`, {
        message: message,
        signature: serializedSignature,
        publicKey: publicKey,
        timestamp: Date.now(),
      });
      //console.log(response);
    } catch (err) {
      console.error(err);
    } finally {
      if (response.status === 200) {
        setAddress(address);
        setPrivateKey(newPrivateKey);
        alert(
          'The new wallet have been created. Preess "Update balance" button to see a welcoming bonus 0.1 ETH'
        );
      }
    }
  }

  function displayPrivateKey() {
    return (
      <label>
        Your private key: (copy and save it)
        <textarea value={privateKey} readOnly rows={3} />
        Your wallet address:
        <textarea readOnly rows={3} value={address} />
      </label>
    );
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <label>
        Enter your private key
        <input
          placeholder="Type your private key for the address"
          value={privateKey || ""}
          onChange={handlePrivateKeyChange}
        ></input>
        {privKeyError && (
          <div style={{ color: 'red' }}>invalid private key</div>
        )}
      </label>
      <label>
        Wallet Address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address || ""}
          onChange={onChange}
        ></input>
      </label>
      <button onClick={requestBallance}>Update balance</button>

      <div className="balance">Balance: {parseFloat(balance.toFixed(8))} ETH</div>
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
