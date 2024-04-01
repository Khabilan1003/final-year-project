import { NavLink } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NavBar = ({activePage}) => {
    const navigate = useNavigate();
    const logoutHandler = async () => {
    try {
      const result = await axios.post(
        "http://127.0.0.1:5000/logout",
        {},
        {
          withCredentials: true,
        }
      );

      if (result.data.error === false) {
        navigate("/login");
      }
    } catch (error) {
      console.log(`Logout Error : ${error}`);
    }
  };

  const navigation = [
    {name : "Home" , to : "/homepage" , handler : null},
    {name : "Patents" , to : "/patents" , handler : null},
    {name : "Logout" , to : "" , handler : logoutHandler},
  ]

    return (
    <div className=" bg-blue-500 flex justify-between items-center">
        <h3 className="p-4 text-xl text-white font-semibold tracking-wide">Patent Office Website</h3>
        <div>
            <ul className="flex items-center">
              {navigation.map(nav => <li className={`text-white`}>
                <NavLink className={`p-4 hover:bg-blue-400 ${activePage == nav.name && "bg-blue-400"}`} to={nav.to} onClick={nav.handler}>
                 {nav.name}
                </NavLink>
              </li>)}
              
            </ul>
        </div>
      </div>);
    
}

export default NavBar;