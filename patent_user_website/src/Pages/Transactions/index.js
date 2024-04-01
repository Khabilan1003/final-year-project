import { useEffect, useState } from "react";
import style from "./style.module.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { addDays, addMonths } from "date-fns";

const Transactions = ({
  connectedWallet,
  connectToMetaMask,
  logoutHandler,
}) => {
  const [royaltyMade, setRoyaltyMade] = useState([]);
  const [royaltyReceived, setRoyaltyReceived] = useState([]);

  const [isRoyaltyMadeSelected, setIsRoyaltyMadeSelected] = useState(true);

  const ownedTransactionsHandler = async () => {
    try {
      const result = await axios.post(
        "http://127.0.0.1:5000/user/royaltyMade",
        {},
        {
          withCredentials: true,
        }
      );

      if (result.data.error == false) {
        let data = [...result.data.documents];
        for (let i = 0; i < data.length; i++) {
          data[i]["createdAt"] = new Date(data[i]["createdAt"]);
          data[i]["expiresAt"] = addDays(
            data[i]["createdAt"],
            data[i]["months"] * 30
          );
        }
        console.log("Royalty Made", data);
        setRoyaltyMade(data);
      }
    } catch (error) {
      console.log(`Logout Error : ${error}`);
    }
  };

  const senderTransactionsHandler = async () => {
    try {
      const result = await axios.post(
        "http://127.0.0.1:5000/user/royaltyReceived",
        {},
        {
          withCredentials: true,
        }
      );
      if (result.data.error == false) {
        let data = [...result.data.documents];
        for (let i = 0; i < data.length; i++) {
          data[i]["createdAt"] = new Date(data[i]["createdAt"]);
          data[i]["expiresAt"] = addDays(
            data[i]["createdAt"],
            data[i]["months"] * 30
          );
        }

        console.log("Royalty Received", data);
        setRoyaltyReceived(data);
      }
    } catch (error) {
      console.log(`Logout Error : ${error}`);
    }
  };

  useEffect(() => {
    ownedTransactionsHandler();
    senderTransactionsHandler();
  }, []);

  return (
    <>
      {/* Header */}
      <div className={style.navigation}>
        <h3 className={style.title}>Patent Website</h3>
        <div>
          <div className={style.linkContainer}>
            <ul className={style.unordered_list_desktop}>
              <li className={`${style.page}`}>
                <NavLink className={`${style.navlink}`} to="/patentSearch">
                  Patent Search
                </NavLink>
              </li>
              <li className={`${style.page}`}>
                <NavLink className={style.navlink} to="/applyPatent">
                  Apply Patent
                </NavLink>
              </li>
              <li className={style.page}>
                <NavLink className={style.navlink} to="/patentStatus">
                  Patent Status
                </NavLink>
              </li>
              <li className={style.page}>
                <NavLink className={`${style.navlink} ${style.active}`}>
                  Transactions
                </NavLink>
              </li>
              <li className={`${style.page}`}>
                <NavLink className={style.navlink} onClick={connectToMetaMask}>
                  {String(connectedWallet).length == 0
                    ? "Connect Metamask"
                    : String(connectedWallet).substring(0, 6) +
                      "..." +
                      String(connectedWallet).substring(38)}
                </NavLink>
              </li>
              <li className={`${style.page}`}>
                <NavLink className={style.navlink} onClick={logoutHandler}>
                  Logout
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Royalty Button Group */}
      <div className="flex items-center justify-center mt-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`${
              isRoyaltyMadeSelected
                ? "bg-blue-500 text-white"
                : "text-blue-500 bg-transparent"
            } px-4 py-2 font-medium text-base border-2 rounded-s-lg border-blue-500 hover:bg-blue-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-blue-500 focus:text-white`}
            onClick={() => setIsRoyaltyMadeSelected(true)}
          >
            Royalty Made
          </button>
          <button
            type="button"
            className={`${
              !isRoyaltyMadeSelected
                ? "bg-blue-500 text-white"
                : "text-blue-500 bg-transparent"
            } px-4 py-2 font-medium text-base border-2 border-blue-500 rounded-e-lg hover:bg-blue-500 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-blue-500 focus:text-white `}
            onClick={() => setIsRoyaltyMadeSelected(false)}
          >
            Royalty Received
          </button>
        </div>
      </div>

      {/* Data */}
      {isRoyaltyMadeSelected ? (
        royaltyMade.length == 0 ? (
          <p className="text-center mt-4 text-xl">No Royalty Made</p>
        ) : (
          <div className="mx-8">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg container mx-auto mt-10">
              <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <thead className="bg-blue-500 text-md uppercase text-white">
                  <tr>
                    <th scope="col" className="px-9 py-3">
                      Patent Title
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Expire Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount Payed(ETH)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount Payed(USD)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {royaltyMade.map((document) => (
                    <tr
                      key={document.title}
                      className="border-b bg-white hover:bg-gray-50 text-black"
                    >
                      <th
                        scope="row"
                        className="flex items-center whitespace-nowrap px-6 py-4"
                      >
                        <div className="ps-3">
                          <div className="text-base font-semibold">
                            {document.title}
                          </div>
                        </div>
                      </th>
                      <td className="px-6 py-4">
                        {document.createdAt.toString().substring(4, 16)}
                      </td>
                      <td className="px-6 py-4">
                        {document.expiresAt.toString().substring(4, 16)}
                      </td>
                      <td className="px-6 py-4">
                        {(parseInt(document.amountInWeiPayed) / 1e18).toFixed(
                          6
                        )}
                        ETH
                      </td>
                      <td className="px-6 py-4">
                        {parseInt(document.amountInDollarPayed)} USD
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        {document.createdAt <= new Date() &&
                        new Date() <= document.expiresAt ? (
                          <div className="flex flex-row items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <p>Ongoing</p>
                          </div>
                        ) : (
                          <div className="flex flex-row items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <p>Expired</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : null}

      {!isRoyaltyMadeSelected ? (
        royaltyReceived.length == 0 ? (
          <p className="text-center mt-4 text-xl">No Royalty Received</p>
        ) : (
          <div className="mx-8">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg container mx-auto mt-10">
              <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <thead className="bg-blue-500 text-md uppercase text-white">
                  <tr>
                    <th scope="col" className="px-9 py-3">
                      Patent Title
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Sender AadharNumber
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Expire Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount Received(ETH)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount Received(Dollars)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {royaltyReceived.map((document) => (
                    <tr
                      key={document.title}
                      className="border-b bg-white hover:bg-gray-50 text-black"
                    >
                      <th
                        scope="row"
                        className="flex items-center whitespace-nowrap px-6 py-4"
                      >
                        <div className="ps-3">
                          <div className="text-base font-semibold">
                            {document.title}
                          </div>
                        </div>
                      </th>
                      <td className="px-6 py-4">
                        {document.senderAadharNumber}
                      </td>
                      <td className="px-6 py-4">
                        {document.createdAt.toString().substring(4, 16)}
                      </td>
                      <td className="px-6 py-4">
                        {document.expiresAt.toString().substring(4, 16)}
                      </td>
                      <td className="px-6 py-4">
                        {(
                          parseInt(document.amountInWeiPayed) /
                          1e18 /
                          document.numberOfCoinventors
                        ).toFixed(6)}{" "}
                        ETH
                      </td>
                      <td className="px-6 py-4">
                        {parseInt(document.amountInDollarPayed) /
                          document.numberOfCoinventors}{" "}
                        USD
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        {document.createdAt <= new Date() &&
                        new Date() <= document.expiresAt ? (
                          <div className="flex flex-row items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <p>Ongoing</p>
                          </div>
                        ) : (
                          <div className="flex flex-row items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <p>Expired</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : null}
    </>
  );
};

export default Transactions;
