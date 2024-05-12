import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";
import logo from "./assets/Images/whisprr.ico";

export default function PasswordReset() {
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

    async function handleSubmit(ev) {
        ev.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post("/password-reset", {
                username,
                newPassword
            });
            const { id, username: loggedInUsername } = response.data;
            setLoggedInUsername(loggedInUsername);
            setId(id);
            window.location.href = "/";
        } catch (error) {
            console.error("Error resetting password:", error);
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <img src={logo} alt="Whispr Logo" />
                <input value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text" placeholder="username"
                    className="block w-full rounded-md p-2 mb-2 border" />
                <input value={newPassword}
                    onChange={ev => setNewPassword(ev.target.value)}
                    type="password" placeholder="New Password"
                    className="block w-full rounded-md p-2 mb-2 border" />
                <input value={confirmPassword}
                    onChange={ev => setConfirmPassword(ev.target.value)}
                    type="password" placeholder="Confirm Password"
                    className="block w-full rounded-md p-2 mb-2 border" />
                <button className="bg-blue-500 block text-white w-full rounded-md p-2 ">
                    Reset Password
                </button>
                <button onClick={() => window.location.href = "/"} className="flex items-center pl-10 m-3">
                    Back to login page
                </button>
            </form >
        </div >
    );
}