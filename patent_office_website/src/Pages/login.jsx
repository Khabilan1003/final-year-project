import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InfinitySpin } from "react-loader-spinner";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const loginHandler = async () => {
    setUsernameErrorMessage("Username is empty");
    setPasswordErrorMessage("Password should have atleast 6 character");
    if (username.length == 0 && password.length < 6) {
      setIsValidUsername(true);
      setIsValidPassword(true);
    } else if (username.length == 0) {
      setIsValidUsername(true);
      setIsValidPassword(false);
    } else if (password.length < 6) {
      setIsValidPassword(true);
      setIsValidUsername(false);
    } else {
      setIsValidUsername(false);
      setIsValidPassword(false);

      try {
        const result = await axios.post(
          "http://127.0.0.1:5000/patentOffice/login",
          {
            username: username,
            password: password,
          },
          {
            withCredentials: true,
          }
        );

        if (result.data.error == false) {
          navigate("/homepage");
        }
      } catch (error) {
        console.log(`Login Handler Error : ${error}`);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <InfinitySpin color="#0171d3" />
      </div>
    );
  }

  return (
    <section className="h-screen w-screen bg-blue-600">
      <div className="flex items-center justify-center h-full">
        <div className="bg-white shadow-md p-4 rounded-lg w-2/3 lg:w-1/4">
          <h3 className="text-center text-3xl font-semibold mb-4">Login</h3>

          <div className="my-4">
            <input
              type="text"
              placeholder="Username"
              className="border rounded-md p-2 w-full"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {isValidUsername && (
            <p className=" text-red-600 ml-1 mt-1">{usernameErrorMessage}</p>
          )}

          <div className="my-4">
            <input
              type="password"
              placeholder="Password"
              className="border rounded-md p-2 w-full"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isValidPassword && (
            <p className=" text-red-600 ml-1 mt-1">{passwordErrorMessage}</p>
          )}

          <div className="w-full">
            <button
              className="w-full bg-blue-500 text-white text-xl p-2 mt-4"
              onClick={loginHandler}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
