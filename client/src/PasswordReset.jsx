import logo from "./assets/Images/whisprr.ico";
import axios from "axios";
import { useContext, useState } from "react"
import { UserContext } from "./UserContext";

export default function PasswordReset() {
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
    async function handleSubmit(ev) {
        ev.preventDefault();
            const { data } = await axios.post(url, { username })
        setLoggedInUsername(username);
        setId(data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            {console.log("password Reset Page")}
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <img src={logo} alt="Whispr Logo" />
                <input value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text" placeholder="username"
                    className="block w-full rounded-md p-2 mb-2 border" />
                {/* mb =  */}
                <input value={newPassword}
                    onChange={ev => setNewPassword(ev.target.value)}
                    type="password" placeholder="New Password"
                    className="block w-full rounded-md p-2 mb-2 border" />
                <input value={confirmPassword}
                    onChange={ev => setConfirmPassword(ev.target.value)}
                    type="password" placeholder="Confirm Password"
                    className="block w-full rounded-md p-2 mb-2 border" />
                <button className="bg-blue-500 block text-white w-full rounded-md p-2 ">
                  
                </button>
            </form >
        </div >
    )
}