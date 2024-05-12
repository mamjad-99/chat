import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import PasswordReset from "./PasswordReset";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";

export default function Routes() {
    const { username } = useContext(UserContext);
    const [reset, setReset] = useState(false);

    if (reset) {
        return <PasswordReset onBackToLogin={() => setReset(false)} />;
    }

    if (username) {
        return <Chat />;
    }

    return <RegisterAndLoginForm setReset={setReset} />;
}
