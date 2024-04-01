import {
  AccordionItem,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemHeading,
} from "react-accessible-accordion";
import style from "./style.module.css";
import { ethers } from "ethers";
import { abi } from "../../constant";
import axios from "axios";
import RoyaltyPaymentDialog from "../royalty_payment_dialog";
import { useState } from "react";

const PatentTile = ({ title, abstract, contractAddress, aadharNumber }) => {
  const [isRoyaltyMenuOpen, setIsRoyaltyMenuOpen] = useState(false);
  console.log(aadharNumber);
  const toggler = () => {
    setIsRoyaltyMenuOpen((prev) => !prev);
  };

  const royaltyPayment = async () => {
    const months = 3n;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const monthlyPayInWei = 10000000000000000n;
    let totalPayInWei = monthlyPayInWei * months;

    const tx = await contract.royaltyPayment(months, {
      value: totalPayInWei,
    });
    const tx_receipt = await tx.wait();

    console.log(tx_receipt);

    try {
      await axios.post(
        "http://127.0.0.1:5000/user/storeTransaction",
        {
          ownerAadharNumber: aadharNumber,
          title: title,
          months: months.toString(),
          amountInWeiPayed: totalPayInWei.toString(),
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(`Store Transaction Error : ${error}`);
    }
  };

  return (
    <>
      {isRoyaltyMenuOpen && (
        <RoyaltyPaymentDialog
          aadharNumber={aadharNumber}
          title={title}
          contractAddress={contractAddress}
          closeDialog={toggler}
        />
      )}
      <AccordionItem className={style.AccordionItem}>
        <AccordionItemHeading className={style.AccordionItemHeading}>
          <AccordionItemButton className={style.AccordionItemButton}>
            {title}
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel className={style.AccordionItemPanel}>
          <p>{abstract}</p>
          {contractAddress != null ? (
            <div className={style.paymentButton}>
              <button onClick={toggler}>Royalty Payment</button>
            </div>
          ) : (
            <></>
          )}
        </AccordionItemPanel>
      </AccordionItem>
    </>
  );
};

export default PatentTile;
