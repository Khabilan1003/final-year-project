import { NavLink } from "react-router-dom";
import style from "./style.module.css";
import { useEffect, useState } from "react";
import RoyaltyUpdateDialog from "../../Components/royalty_update_dialog";
import axios from "axios";

const Status = {
  1: "Pending",
  3: "Approved",
  4: "Rejected",
};

const PatentStatus = ({
  connectedWallet,
  connectToMetaMask,
  logoutHandler,
}) => {
  const [patentStatus, setPatentStatus] = useState([]);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  useEffect(() => {
    const patentStatus = async () => {
      try {
        const result = await axios.get(
          "http://127.0.0.1:5000/user/patentStatus",
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setPatentStatus(result.data.documents);
        console.log(result.data.documents);
      } catch (error) {
        console.log("Patent Status Error : ", error);
      }
    };

    patentStatus();
  }, []);

  const deletePatentHandler = async (title) => {
    try {
      const result = await axios.delete(
        `http://127.0.0.1:5000/user/patent?patentTitle=${title}`,
        { withCredentials: true }
      );
      if (result.status === 200) {
        setPatentStatus((patentStatus) =>
          patentStatus.filter((patent) => patent.title != title)
        );
      }
    } catch (exception) {
      console.log(`Exception : ${exception}`);
    }
  };

  const toggleUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
  };

  const updatePatentRoyaltyHandler = (title, status, amount) => {
    setSelectedPatent({
      title,
      status,
      amount,
    });
    setIsUpdateDialogOpen(true);
  };

  return (
    <>
      {isUpdateDialogOpen && (
        <RoyaltyUpdateDialog
          patentTitle={selectedPatent.title}
          status={selectedPatent.status}
          royaltyAmount={selectedPatent.amount}
          toggleUpdateDialog={toggleUpdateDialog}
        />
      )}

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
                <NavLink className={`${style.navlink} ${style.active}`}>
                  Patent Status
                </NavLink>
              </li>
              <li className={style.page}>
                <NavLink className={style.navlink} to="/transactions">
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

      {/* Patent Status Table */}

      {patentStatus.length != 0 ? (
        <div className="mx-8">
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg container mx-auto mt-10">
            <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
              <thead className="bg-blue-500 text-md uppercase text-white">
                <tr>
                  <th scope="col" className="px-9 py-3">
                    Patent Title
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Royalty Amount
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {patentStatus.map((status) => (
                  <tr className="border-b bg-white hover:bg-gray-50 text-black">
                    <th
                      scope="row"
                      className="flex items-center whitespace-nowrap px-6 py-4"
                    >
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          {status.title}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {status.patentStatus === 1 && (
                          <div className="me-2 h-2.5 w-2.5 rounded-full bg-orange-500"></div>
                        )}
                        {status.patentStatus === 3 && (
                          <div className="me-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                        )}
                        {status.patentStatus === 4 && (
                          <div className="me-2 h-2.5 w-2.5 rounded-full bg-red-500"></div>
                        )}
                        {Status[status.patentStatus]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {status.patentStatus === 3 ? (
                        <span>
                          {status["royalty_per_month"]}
                          <span> USD per month</span>
                        </span>
                      ) : (
                        <span>None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {String(status.createdAt).substring(0, 16)}
                    </td>
                    <td className="px-6 py-4 space-x-4">
                      {status.patentStatus == 1 && (
                        <button
                          onClick={() => deletePatentHandler(status.title)}
                          className="bg-red-600 px-1 py-1 rounded-md text-white hover:text-red-600 hover:bg-white border-2 border-red-600  font-semibold cursor-pointer"
                        >
                          Delete Patent
                        </button>
                      )}

                      {status.patentStatus == 3 && (
                        <button
                          onClick={() =>
                            updatePatentRoyaltyHandler(
                              status.title,
                              Status[status.patentStatus],
                              status["royalty_per_month"]
                            )
                          }
                          className="bg-blue-600 px-1 py-1 rounded-md text-white hover:text-blue-600 hover:bg-white border-2 border-blue-600  font-semibold cursor-pointer"
                        >
                          Edit Royalty Amount
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-2xl text-gray-700 mt-16 font-semibold text-center">
          No Patent has been registered yet...
        </p>
      )}
    </>
  );
};

export default PatentStatus;
