import { useState } from "react";
import server from "./server";
import {
  signMessage,
  getAddress,
  calculateAddressFromPrivateKey,
  serializeSignature,
} from "./helperFunctions";
import { secp256k1 as secp } from "ethereum-cryptography/secp256k1.js";
function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if (!privateKey) alert("you have not provided a private key");
    else {
      const message = self.crypto.randomUUID().toString();
      const signature = await signMessage(message, privateKey);
      const serializedSignature = serializeSignature(signature);
      try {
        const {
          data: { balance },
        } = await server.post(`send`, {
          sender: address,
          amount: parseFloat(sendAmount),
          recipient,
          signature: serializedSignature,
          message: message,
          publicKey: secp.getPublicKey(privateKey),
          timestamp: Date.now(),
        });
        setBalance(balance);
      } catch (ex) {
        alert(ex.response.data.message);
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
