const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
};

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function parseSignature(singnature) {
  return JSON.parse(singnature, function (_, value) {
    if (!isNaN(value)) {
      return BigInt(value);
    }
    return value;
  });
}

function getAddress(publicKey) {
  return "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));
}

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function verifyAction(message, publicKey, signature) {
  signature = parseSignature(signature);
  const messageHash = hashMessage(message);
  const parsedPublicKey = new Uint8Array(Object.values(publicKey));
  return [
    secp256k1.verify(signature, messageHash, parsedPublicKey),
    parsedPublicKey,
  ];
}

app.post("/balance/:address", (req, res) => {
  const { address } = req.params;
  let { message, signature, publicKey } = req.body;
  const [okay, parsedPublicKey] = verifyAction(message, publicKey, signature);
  if (okay && getAddress(parsedPublicKey) === address) {
    const balance = balances[address] || 0;
    res.status(200).send({ balance });
  }
});

app.post("/send", (req, res) => {
  let { sender, recipient, amount, signature, message, publicKey, timestamp } =
    req.body;
  if (verifyAction(message, publicKey, signature)) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.post("/create", (req, res) => {
  let { message, signature, publicKey, timestamp } = req.body;
  const [okay, parsedPubKey] = verifyAction(message, publicKey, signature);
  if (okay) {
    const newAddress = getAddress(parsedPubKey);
    balances[newAddress] = 0.1;
    console.log(balances);
    console.log("all is okay");
  }
  res.status(200).send({ message: "wallet created" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
