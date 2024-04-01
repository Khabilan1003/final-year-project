import { NavLink } from "react-router-dom";
import style from "./style.module.css";
import axios from "axios";
import { useState } from "react";
import PatentTile from "../../Components/PatentTIle";
import { Accordion } from "react-accessible-accordion";

const PatentSearch = ({
  connectedWallet,
  connectToMetaMask,
  logoutHandler,
}) => {
  const [searchedPatent, setSearchedPatent] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [search, setSearch] = useState("");

  const searchPatents = async () => {
    try {
      const result = await axios.post(
        "http://127.0.0.1:5000/user/patentSearch",
        {
          search: search,
        },
        {
          withCredentials: true,
        }
      );
      console.log(result.data);
      setIsSearched(true);
      setSearchedPatent([...result.data.documents]);
    } catch (error) {
      console.log(`Search Patent Error : ${error}`);
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
                <NavLink className={`${style.navlink} ${style.active}`}>
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

      <div className={style.searchBarContainer}>
        <input
          type="text"
          className={style.query}
          placeholder="Search Patent"
          onChange={(e) => setSearch(e.target.value)}
          onEnter
        />
        <button className={style.button} onClick={searchPatents}>
          <svg viewBox="0 0 1024 1024" className={style.svg}>
            <path
              class="path1"
              d="M848.471 928l-263.059-263.059c-48.941 36.706-110.118 55.059-177.412 55.059-171.294 0-312-140.706-312-312s140.706-312 312-312c171.294 0 312 140.706 312 312 0 67.294-24.471 128.471-55.059 177.412l263.059 263.059-79.529 79.529zM189.623 408.078c0 121.364 97.091 218.455 218.455 218.455s218.455-97.091 218.455-218.455c0-121.364-103.159-218.455-218.455-218.455-121.364 0-218.455 97.091-218.455 218.455z"
            ></path>
          </svg>
        </button>
      </div>

      {!isSearched && (
        <p className={style.isSearched}> Unlock the Power of Patent Search</p>
      )}

      {isSearched && searchedPatent.length == 0 && (
        <p className={style.isSearched}> No Match Found!</p>
      )}

      {isSearched && searchedPatent.length != 0 ? (
        <Accordion className={style.Accordion}>
          {searchedPatent.map((document, index) => (
            <PatentTile
              key={index}
              title={document.title}
              abstract={document.abstract}
              aadharNumber={document.aadharNumber}
              contractAddress={document.contractAddress}
            />
          ))}
        </Accordion>
      ) : (
        <></>
      )}
    </>
  );
};

export default PatentSearch;
