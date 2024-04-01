import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import style from "./style.module.css";

const Signup = () => {
  const [aadharNumber, setAadharNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidAadharNumber, setIsValidAadharNumber] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const signupHandler = async () => {
    setIsValidAadharNumber(false);
    setIsValidName(false);
    setIsValidPassword(false);
    setIsValidConfirmPassword(false);

    if (name.length === 0) {
      setIsValidName(true);
    } else if (aadharNumber.length !== 12) {
      setIsValidAadharNumber(true);
    } else if (password.length < 6) {
      setIsValidPassword(true);
    } else if (password !== confirmPassword) {
      setIsValidConfirmPassword(true);
    } else {
      try {
        const result = await axios.post(
          "http://127.0.0.1:5000/user/signup",
          {
            name: name,
            aadharNumber: aadharNumber,
            password: password,
          },
          {
            withCredentials: true,
          }
        );

        if (result.data.error === false) {
          navigate("/login");
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
          <h3 className={style.title}>Signup</h3>
          <div className={`${style.field} ${style.input_field}`}>
            <input
              type="text"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {isValidName && <p className={style.error}>Name is required</p>}
          <div className={`${style.field} ${style.input_field}`}>
            <input
              type="text"
              placeholder="Aadhar Number"
              onChange={(e) => setAadharNumber(e.target.value)}
            />
          </div>
          {isValidAadharNumber && (
            <p className={style.error}>Aadhar number should be 12 digit</p>
          )}
          <div className={`${style.field} ${style.input_field}`}>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {isValidPassword && (
            <p className={style.error}>
              {" "}
              Password should be atleast 6 characters
            </p>
          )}
          <div className={`${style.field} ${style.input_field}`}>
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {isValidConfirmPassword && (
            <p className={style.error}>
              Confirm Password should be same as Password
            </p>
          )}
          <div className={`${style.field} ${style.button_field}`}>
            <button onClick={signupHandler}>Signup</button>
          </div>

          <div className={style.form_link}>
            <span>Already have an account?</span>
            <Link to="/login" className={`${style.link}`}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
