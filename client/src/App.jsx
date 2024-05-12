import axios from "axios"
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = "http://localhost:3000";
  axios.defaults.withCredentials = true;  //cookies
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>

  )
}

export default App
