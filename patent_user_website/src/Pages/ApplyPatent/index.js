import { NavLink } from "react-router-dom";
import style from "./style.module.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

const ApplyPatent = ({
  connectedWallet,
  connectToMetaMask,
  deployContract,
  logoutHandler,
}) => {
  const [patentTitle, setPatentTitle] = useState("");
  const [patentAbstract, setPatentAbstract] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [coinventors, setCoinventors] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentCoinventorName, setCurrentCoinventorName] = useState("");
  const fileInputRef = useRef(null);

  const [isSubmitting , setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUsersList = async () => {
      try {
        const result = await axios.get("http://127.0.0.1:5000/user/users", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        setUsers(result.data.documents);
        console.log(result.data.documents);
      } catch (exception) {
        console.log(`Get Users Error : ${exception}`);
      }
    };
    getUsersList();
  }, []);

  const addCoinventors = () => {
    // Check whether it matches with the aadharNumber or name
    for (let i = 0; i < users.length; i++) {
      if (
        users[i].aadharNumber === currentCoinventorName ||
        users[i].name === currentCoinventorName
      ) {
        setCoinventors([users[i], ...coinventors]);
        setCurrentCoinventorName("");
        return;
      }
    }

    alert("Invalid Name/Aadhar Number. Enter Valid Number");
  };

  const removeCoinventor = async (inventor) => {
    setCoinventors(coinventors.filter((coinventor) => coinventor !== inventor));
  };

  const clearHandler = async () => {
    try {
      setPatentAbstract("");
      setPatentTitle("");
      setSelectedFile(null);
      setCoinventors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.log(`Clear Handler Error : ${error}`);
    }
  };

  const applyHandler = async () => {
    if (patentTitle.trim().length === 0) {
      alert("Enter Patent Title");
    } else if (patentAbstract.trim().length === 0) {
      alert("Enter Patent Abstract");
    } else if (selectedFile === null) {
      alert("Select Patent Document");
    } else {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", patentTitle);
      formData.append("abstract", patentAbstract);
      formData.append("file", selectedFile);
      
      const coinven = [];
      for (let i = 0; i < coinventors.length; i++) {
        coinven.push(coinventors[i].aadharNumber);
      }

      formData.append("coinventors", coinven);
      
      try {
        const result = await axios.post(
          "http://127.0.0.1:5000/user/patentApply",
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (result.status == 200) {
          deployContract(patentTitle , coinventors);
          clearHandler();
        }

      } catch (error) {
        console.log(`Apply Handler Error : ${error}`);
      }

      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                <NavLink className={`${style.navlink} ${style.active}`}>
                  Apply Patent
                </NavLink>{" "}
                <li className={style.page}>
                  <NavLink className={style.navlink} to="/patentStatus">
                    Patent Status
                  </NavLink>
                </li>
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
                      String(connectedWallet).substring(38)}{" "}
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

      <div className={style.container}>
        <div className={style.formContainer}>
          <h3 className={style.formTitle}>Patent Application Form</h3>

          <input
            className={style.text_field}
            type="text"
            placeholder="Title of the Patent"
            value={patentTitle}
            onChange={(e) => setPatentTitle(e.target.value)}
          />
          {Array.from(
            { length: coinventors.length + 1 },
            (_, index) => index
          ).map((index) => {
            return (
              <>
                <div className="flex flex-row space-x-2">
                  {index !== coinventors.length ? (
                    <>
                      <input
                        className={`${style.text_field}`}
                        placeholder="Co-inventor(optional)"
                        value={`${coinventors[index].name} (${coinventors[index].aadharNumber})`}
                        disabled
                      />
                      <button
                        className="border-2 h-12 mt-5 rounded-md px-3 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => removeCoinventor(coinventors[index])}
                      >
                        <FaTrash size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className={`${style.text_field}`}
                        placeholder="Co-inventor(optional)"
                        value={currentCoinventorName}
                        onChange={(e) =>
                          setCurrentCoinventorName(e.target.value)
                        }
                      />
                      <button
                        className="border-2 h-12 mt-5 rounded-md px-2.5 hover:bg-blue-500 hover:text-white"
                        onClick={addCoinventors}
                      >
                        <IoAddSharp size={20} />{" "}
                      </button>
                    </>
                  )}
                </div>
              </>
            );
          })}
          <textarea
            className={style.text_area}
            rows={6}
            placeholder="Abstract of the Patent"
            value={patentAbstract}
            onChange={(e) => setPatentAbstract(e.target.value)}
          />
          <input
            className={style.fileInput}
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              setSelectedFile(file);
            }}
          />
          <div className={style.button_container}>
            {!isSubmitting ? <>
            <button className={style.button} onClick={clearHandler}>
              Clear
            </button>
            <button className={style.button} onClick={applyHandler}>
              Apply
            </button> 
            </> : <>
              <span class="loader"></span>
            </> }

            
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyPatent;
