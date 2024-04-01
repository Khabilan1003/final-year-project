import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import PatentSearch from "./Pages/PatentSearch";
import ApplyPatent from "./Pages/ApplyPatent";
import PatentStatus from "./Pages/PatentStatus";
import { Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { abi, contractBinary } from "./constant";
import Transactions from "./Pages/Transactions";

function App() {
  const [connectedWallet, setConnectedWallet] = useState("");

  const connectToMetaMask = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        setConnectedWallet(accounts[0].address);
        if (accounts.length > 0) {
          const result = await axios.post(
            "http://127.0.0.1:5000/user/connectMetaAccount",
            {
              metaAddress: accounts[0].address,
            },
            {
              withCredentials: true,
            }
          );
        }
      } else {
        console.error("MetaMask not detected");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask: ", error);
    }
  };

  const deployContract = async (title, owners) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const factory = new ethers.ContractFactory(abi, contractBinary, signer);
    console.log(owners);
    const coinventorsMetaAddress = [];
    for (let i = 0; i < owners.length; i++) {
      coinventorsMetaAddress.push(owners[i].metaAddress);
    }
    coinventorsMetaAddress.push(connectedWallet);

    console.log(coinventorsMetaAddress);
    const deployedContract = await factory.deploy(
      title,
      coinventorsMetaAddress
    );

    const deploymentReceipt = await deployedContract
      .deploymentTransaction()
      .wait();
    const contractAddress = deploymentReceipt.contractAddress;
    console.log(contractAddress);
    try {
      const result = await axios.post(
        "http://127.0.0.1:5000/user/contractAddress",
        {
          title: title,
          contractAddress: contractAddress,
        },
        {
          withCredentials: true,
        }
      );

      if (result.data.error == false) {
        console.log("Success");
      } else {
        console.log(`Error : ${result.data.errorMessage}`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const logoutHandler = async () => {
    try {
      const result = await axios.post(
        "http://127.0.0.1:5000/logout",
        {},
        {
          withCredentials: true,
        }
      );

      if (result.data.error == false) {
        window.location.href = `http://${window.location.hostname}:${window.location.port}/login`;
      }
    } catch (error) {
      console.log(`Logout Error : ${error}`);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/patentSearch"
        element={
          <PatentSearch
            connectedWallet={connectedWallet}
            connectToMetaMask={connectToMetaMask}
            logoutHandler={logoutHandler}
          />
        }
      />
      <Route
        path="/patentStatus"
        element={
          <PatentStatus
            connectedWallet={connectedWallet}
            connectToMetaMask={connectToMetaMask}
            logoutHandler={logoutHandler}
          />
        }
      />
      <Route
        path="/applyPatent"
        element={
          <ApplyPatent
            connectedWallet={connectedWallet}
            connectToMetaMask={connectToMetaMask}
            deployContract={deployContract}
            logoutHandler={logoutHandler}
          />
        }
      />
      <Route
        path="/transactions"
        element={
          <Transactions
            connectedWallet={connectedWallet}
            connectToMetaMask={connectToMetaMask}
            logoutHandler={logoutHandler}
          />
        }
      />
    </Routes>
  );
}

export default App;
