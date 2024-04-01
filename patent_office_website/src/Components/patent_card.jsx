import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { abi } from "../constants";

const PatentCard = ({
  title,
  abstract,
  removePatent,
  contractAddress,
  setLoading,
  toggleIsValidate,
  validatedPatents,
  setValidatedPatents,
  setValidatePatentTitle,
}) => {
  const [connectedWallet, setConnectedWallet] = useState("");
  const downloadFile = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/patentOffice/downloadPatentByTitle",
        {
          title: title,
        },
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document.pdf"); // Set the file name
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error.message);
    }
  };

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

  const toggleContract = async () => {
    await connectWallet();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const toggleResponse = await contract.toggleToValidPatent();
    const toggleReceipt = await toggleResponse.wait(1);

    const toggleValue = await contract.isValidPatent();
    console.log(toggleReceipt);
    console.log(toggleValue);
  };

  const approvePatent = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://127.0.0.1:5000/patentOffice/acceptPatent",
        {
          title: title,
        },
        {
          withCredentials: true,
        }
      );
      removePatent(title);
      if (String(contractAddress).length > 0) await toggleContract();
      setLoading(false);
    } catch (error) {
      console.log(`approve Patent Error : ${error}`);
    }
  };

  const rejectPatent = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        "http://127.0.0.1:5000/patentOffice/rejectPatent",
        {
          title: title,
        },
        {
          withCredentials: true,
        }
      );

      if (result.data.error == false) {
        removePatent(title);
        setLoading(false);
      }
    } catch (error) {
      console.log(`reject Patent Error : ${error}`);
    }
  };

  const validatePatent = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        "http://127.0.0.1:5000/patentOffice/validatePatent",
        {
          title: title,
        },
        {
          withCredentials: true,
        }
      );

      toggleIsValidate();
      setValidatedPatents([...result.data.documents]);
      setValidatePatentTitle(title);
    } catch (error) {
      console.log(`Validate Patent Error : ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="px-2.5 py-5 m-5 shadow-[0_0px_2px_0px_rgba(0,0,0,0.3)] rounded-md">
        <h3 className="my-2.5 text-xl font-semibold">{title}</h3>
        <p className="text-justify line-clamp-3">{abstract}</p>
        <div className="flex justify-end text-white space-x-4">
          <button
            className="px-2 py-1 border-none outline-none rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 bg-gray-600" 
            onClick={downloadFile}
          >
            Download
          </button>
          <button
            className="px-2 py-1 border-none outline-none rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 bg-blue-600"
            onClick={validatePatent}
          >
            Validate
          </button>
          <button
            className="px-2 py-1 border-none outline-none rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 bg-red-600"
            onClick={rejectPatent}
          >
            Reject
          </button>
          <button
            className="px-2 py-1 border-none outline-none rounded-md cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 bg-green-600"
            onClick={approvePatent}
          >
            Approve
          </button>
        </div>
      </div>
    </>
  );
};

export default PatentCard;