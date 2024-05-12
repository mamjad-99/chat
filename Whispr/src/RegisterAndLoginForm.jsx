import logo from "./assets/Images/whisprr.ico";
import axios from "axios";
import { useContext, useState } from "react"
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm({ setReset }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrregister] = useState("login");

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login"
    const { data } = await axios.post(url, { username, password })
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <img src={logo} alt="Whispr Logo" />
        <input value={username}
          onChange={ev => setUsername(ev.target.value)}
          type="text" placeholder="username"
          className="block w-full rounded-md p-2 mb-2 border" />
        <input value={password}
          onChange={ev => setPassword(ev.target.value)}
          type="password" placeholder="password"
          className="block w-full rounded-md p-2 mb-2 border" />
        <button className="bg-blue-500 block text-white w-full rounded-md p-2 ">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" ? "Already have Account? " : "Don't have an account? "}
          <button onClick={() => setIsLoginOrregister(isLoginOrRegister === "register" ? "login" : "register")}>
            {isLoginOrRegister === "register" ? "Login here" : "Create Account"}
          </button>
          {isLoginOrRegister === "login" &&
            <button onClick={() => setReset(true)}>Forgot Password?</button>
          }
        </div>
      </form>
    </div>
  )
}
