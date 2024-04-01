import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import style from "./style.module.css";

const Login = () => {
  const [aadharNumber, setAadharNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isValidAadhar, setIsValidAadhar] = useState(false);
  const [aadharErrorMessage, setAadharErrorMessage] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const navigate = useNavigate();

  const loginHandler = async () => {
    setAadharErrorMessage("Aadhar number should be 12 digit number");
    setPasswordErrorMessage("Password should have atleast 6 character");
    if (aadharNumber.length != 12 && password.length < 6) {
      setIsValidAadhar(true);
      setIsValidPassword(true);
    } else if (aadharNumber.length != 12) {
      setIsValidAadhar(true);
      setIsValidPassword(false);
    } else if (password.length < 6) {
      setIsValidPassword(true);
      setIsValidAadhar(false);
    } else {
      setIsValidAadhar(false);
      setIsValidPassword(false);

      try {
        const result = await axios.post(
          "http://127.0.0.1:5000/user/login",
          {
            aadharNumber: aadharNumber,
            password: password,
          },
          {
            withCredentials: true,
          }
        );

        if (result.data.error == false) {
          navigate("/patentSearch");
        }
      } catch (error) {
        console.log(`Login Handler Error : ${error}`);
      }
    }
  };

  return (
    <section className={`${style.container} ${style.forms}`}>
      <div className={`${style.form} ${style.login}`}>
        <div className={style.form_content}>
          <h3 className={style.title}>Login</h3>
          <div className={`${style.field} ${style.input_field}`}>
            <input
              type="text"
              placeholder="Aadhar Number"
              onChange={(e) => setAadharNumber(e.target.value)}
            />
          </div>

          {isValidAadhar && <p className={style.error}>{aadharErrorMessage}</p>}

          <div className={`${style.field} ${style.input_field}`}>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isValidPassword && (
            <p className={style.error}>{passwordErrorMessage}</p>
          )}

          <div className={`${style.field} ${style.button_field}`}>
            <button onClick={loginHandler}>Login</button>
          </div>
          <div className={style.form_link}>
            <span>Don't have an account?</span>
            <Link to="/signup" className={`${style.link}`}>
              Signup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
