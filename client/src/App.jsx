import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState('')
  const [accRegStep, setAccRegStep] = useState(false)

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        accRegStep={accRegStep}
        setAccRegStep={setAccRegStep}
      />
      <Transfer
        setBalance={setBalance}
        address={address}
        privateKey={privateKey}
      />  
    </div>
  );
}

export default App;
