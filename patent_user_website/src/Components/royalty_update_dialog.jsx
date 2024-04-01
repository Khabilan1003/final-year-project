import { IoIosClose } from "react-icons/io";
import { useState } from "react";
import { ethers } from "ethers";
import { abi } from "../constant";
import axios from "axios";
import { Oval } from "react-loader-spinner";

const RoyaltyUpdateDialog = ({
  patentTitle,
  status,
  royaltyAmount,
  toggleUpdateDialog,
}) => {
  const [currentRoyaltyAmount, setCurrentRoyaltyAmount] =
    useState(royaltyAmount);
  const [isLoading, setIsLoading] = useState(false);

  const [connectedWallet, setConnectedWallet] = useState(null);
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

  const getContractAddress = async () => {
    try {
      let result = await axios.get(
        `http://127.0.0.1:5000/user/contractAddress?title=${patentTitle}`,
        { withCredentials: true }
      );
      return result.data.contractAddress;
    } catch (exception) {
      console.log(`Exception : ${exception}`);
    }
  };

  const changeRoyaltyAmountInContractHandler = async (contractAddress) => {
    await connectWallet();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const amountChangedResponse = await contract.changeMonthlyPay(
      currentRoyaltyAmount
    );
    const amountChangedReceipt = await amountChangedResponse.wait(1);
    const amount = await contract.monthlyPayInDollars();

    console.log(amount);
    console.log(amountChangedReceipt);

    return currentRoyaltyAmount == amount;
  };

  const changeRoyaltyAmountInDB = async () => {
    try {
      const result = await axios.put(
        `http://127.0.0.1:5000/user/patent?title=${patentTitle}&amount=${currentRoyaltyAmount}`,
        {},
        { withCredentials: true }
      );

      return result.data.status === 200;
    } catch (exception) {
      console.log(`Exception : ${exception}`);
    }
  };

  const changeRoyaltyHandler = async () => {
    try {
      if (royaltyAmount == currentRoyaltyAmount) return;

      setIsLoading(true);
      console.log("Step - 1");
      // 1. Get the Contract Address
      const contractAddress = await getContractAddress();

      console.log("Step - 2");
      // 2. Change the royalty amount in contract
      let status = await changeRoyaltyAmountInContractHandler(contractAddress);

      console.log("Step - 3");
      // 3. Change the royalty amount in Database
      status = await changeRoyaltyAmountInDB();

      console.log("Step - 4");
      if (status === true) {
        console.log("Royalty Amount Updated Successfully");
      }
      setIsLoading(false);
    } catch (exception) {
      console.log(`Exception : ${exception}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed h-screen w-screen bg-slate-800 opacity-10 z-50"></div>

      {/* Dialog */}
      <div className="fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center ">
        <div className="w-2/3 bg-white rounded-lg p-4 shadow-lg">
          <div className="border-b-2 border-black text-xl font-semibold py-2 flex items-center justify-between">
            <h3>Update Patent Royalty</h3>
            <IoIosClose
              className="h-8 w-8 hover:scale-125 hover:shadow-lg rounded-full transition-all duration-150 ease-in-out cursor-pointer"
              onClick={toggleUpdateDialog}
            />
          </div>
          <div className="my-4">
            <label className="font-semibold">Patent Title</label>
            <input
              className="w-full p-2 mt-1 rounded-sm border bg-gray-50"
              disabled
              value={patentTitle}
            />
          </div>
          <div className="my-4">
            <label className="font-semibold">Patent Status</label>
            <input
              className="w-full p-2 mt-1 rounded-sm border bg-gray-50"
              disabled
              value={status}
            />
          </div>
          <div className="my-4">
            <label className="font-semibold">Royalty Per Month</label>
            <input
              className="w-full p-2 mt-1 rounded-sm border bg-gray-50"
              type="number"
              prefix="$"
              value={currentRoyaltyAmount}
              onChange={(e) => setCurrentRoyaltyAmount(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-blue-600 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-md text-white font-semibold p-1.5 rounded-md transition-all duration-100 ease-in-out"
            onClick={isLoading ? null : () => changeRoyaltyHandler()}
          >
            {isLoading ? (
              <span className="w-full flex justify-center">
                <Oval
                  visible={true}
                  height="25"
                  strokeWidth="8"
                  width="25"
                  secondaryColor="#000000"
                  color="#ffffff"
                  ariaLabel="oval-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </span>
            ) : (
              <span>Change Royalty</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default RoyaltyUpdateDialog;
