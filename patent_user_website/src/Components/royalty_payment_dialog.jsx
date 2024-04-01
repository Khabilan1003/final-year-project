import { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { ethers, toBigInt } from "ethers";
import { abi } from "../constant";
import axios from "axios";

const RoyaltyPaymentDialog = ({
  aadharNumber,
  title,
  contractAddress,
  closeDialog,
}) => {
  const incrementDateByMonths = (months) => {
    let date = new Date();
    date.setDate(date.getDate() + months * 30);
    return date.toISOString().substring(0, 10);
  };
  const [royaltyPerMonth, setRoyaltyPerMonth] = useState(0);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [endDate, setEndDate] = useState(incrementDateByMonths(1));
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [amountInWei, setAmountInWei] = useState(null);
  var bigInt = require("big-integer");

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        setConnectedWallet(accounts[0].address);
      } else {
        console.error("MetaMask not detected");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask: ", error);
    }
  };

  const royaltyPaymentHandler = async () => {
    try {
      // Code to connect with Smart Contract
      await connectWallet();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Transaction in Smart Contract
      let months = toBigInt(numberOfMonths);
      let wei = toBigInt(amountInWei) * toBigInt(numberOfMonths);
      const aadhar = await getAadharNumber();
      console.log(months, wei, aadhar);
      const tx = await contract.royaltyPayment(months, aadhar, {
        value: wei,
      });
      const tx_receipt = await tx.wait();
      console.log(tx_receipt);

      // Storing Transaction data in Database
      await storeTransaction(
        title,
        numberOfMonths,
        amountInWei * numberOfMonths,
        royaltyPerMonth * numberOfMonths
      );

      console.log("Transaction Completed");
    } catch (exception) {
      console.log(`Exception : ${exception}`);
    }
  };

  const getAadharNumber = async () => {
    try {
      const result = await axios.get("http://127.0.0.1:5000/user/aadhar", {
        withCredentials: true,
      });
      return result.data.aadharNumber;
    } catch (exception) {
      console.log(`Exception : ${exception}`);
    }
  };

  const storeTransaction = async (
    title,
    months,
    totalPayInWei,
    totalPayInDollars
  ) => {
    try {
      await axios.post(
        "http://127.0.0.1:5000/user/storeTransaction",
        {
          ownerAadharNumber: aadharNumber,
          title: title,
          months: months.toString(),
          amountInWeiPayed: totalPayInWei.toString(),
          amountInDollarPayed: totalPayInDollars,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(`Store Transaction Error : ${error}`);
    }
  };

  useEffect(() => {
    const getWeiToPayUsingSmartContract = async () => {
      try {
        await connectWallet();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, abi, signer);
        const dollarsToPay = await contract.monthlyPayInDollars();
        const amountToPayInWei = await contract.DollarInWei(dollarsToPay);

        setRoyaltyPerMonth(Number(dollarsToPay));
        setAmountInWei(Number(amountToPayInWei));
      } catch (exception) {
        console.log(`Exception : ${exception}`);
      }
    };
    getWeiToPayUsingSmartContract();
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed top-0 left-0 h-screen w-screen bg-gray-300 opacity-20 z-40"></div>

      {/* Dialog */}
      <div className="fixed top-0 left-0 h-screen w-screen z-[5000] flex justify-center items-center">
        <div className="w-2/3 md:w-2/5 bg-white rounded-lg shadow-lg px-4 py-2">
          {/* Header */}
          <div className="py-2 border-b-2 flex items-center justify-between">
            <h2 className="font-semibold text-lg uppercase tracking-wide">
              Royalty Payment
            </h2>
            <IoIosClose
              className="h-8 w-8 hover:scale-125 rounded-full transition-all duration-150 ease-in-out hover:shadow-md cursor-pointer"
              onClick={closeDialog}
            />
          </div>

          <div className="my-4">
            <label className="font-semibold">Patent Title</label>
            <input
              className="w-full p-2 mt-1 rounded-sm border bg-gray-50"
              disabled
              readOnly
              value={title}
            />
          </div>

          <div className="my-4">
            <label className="font-semibold">Royalty Per Month</label>
            <input
              className="w-full p-2 mt-1 rounded-sm border bg-gray-50"
              disabled
              readOnly
              value={royaltyPerMonth}
            />
          </div>

          <div className="my-4">
            <label className="font-semibold">Select Number of Months</label>
            <input
              className="w-full p-2 mt-1 rounded-sm border-2 bg-white"
              type="number"
              min={1}
              prefix="$"
              value={numberOfMonths}
              onChange={(e) => {
                setNumberOfMonths(e.target.value);
                setEndDate(incrementDateByMonths(e.target.value));
              }}
            />
          </div>

          <div className="my-4 flex space-x-4">
            <div className="flex-1">
              <label className="font-semibold">Start Date</label>
              <input
                disabled
                className="p-2 mt-1 border-2 bg-gray-50 w-full rounded-sm"
                type="date"
                readOnly
                value={new Date().toISOString().substring(0, 10)}
              />
            </div>
            <div className="flex-1">
              <label className="font-semibold">End Date</label>
              <input
                disabled
                type="date"
                value={endDate}
                readOnly
                className="p-2 mt-1 border-2 bg-gray-50 w-full rounded-sm"
              />
            </div>
          </div>

          <div className="my-4">
            <label className="font-semibold">
              Total Amount to Pay in Dollars
            </label>
            <input
              className="w-full p-2 mt-1 rounded-sm border-2 bg-white"
              type="number"
              min={1}
              readOnly
              value={royaltyPerMonth * numberOfMonths}
            />
          </div>

          <div className="my-4">
            <label className="font-semibold">
              Total Amount to Pay in Wei (10^-18 Eth)
            </label>
            <input
              className="w-full p-2 mt-1 rounded-sm border-2 bg-gray-50"
              type="number"
              min={1}
              readOnly
              value={amountInWei * numberOfMonths}
            />
          </div>

          <button
            className="w-full bg-blue-600 text-white rounded-lg p-2 my-2 hover:-translate-y-1 hover:shadow-md transition-all duration-150 ease-in"
            onClick={() => royaltyPaymentHandler()}
          >
            Make Payment
          </button>
        </div>
      </div>
    </>
  );
};

export default RoyaltyPaymentDialog;
