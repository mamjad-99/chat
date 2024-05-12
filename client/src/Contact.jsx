import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, onClick, selected, online, onDeleteUser, onDeleteChat }) {
    function deleteUser(ev){
        ev.stopPropagation();
        onDeleteUser(id);
    }

    function deleteChat(ev){
        ev.stopPropagation();
        onDeleteChat(id);
    }

    return (
        <div key={id} onClick={() => onClick(id)}
            className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (selected ? "bg-red-100" : "")}>
            {selected && (
                <div className="w-1 bg-red-500 h-12 rounded-r-lg"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
                <Avatar userId={id} username={username} online={online} />
                <span className="text-gray-800">{username}</span>
            </div>
            <div className="flex gap-5 py-2 pl-4 items-center">
                <button className="rounded-full bg-blue-300 pl-1 px-2" onClick={deleteUser}>Unfriend</button>
                <button className="rounded-full bg-blue-300 pl-1 px-2" onClick={deleteChat}>Delete Messages</button>
            </div>
        </div>
    )
}