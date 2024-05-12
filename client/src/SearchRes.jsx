import { useState } from "react";
import Avatar from "./Avatar.jsx";
import axios from "axios";

export default function SearchRes({ id, onlinePeople,myname }) {
    const [searchText, setSearchText] = useState("");
    const [searchResult, setSearchResult] = useState({});
    const [selectedUserId, setSelectedUserId] = useState("");

    function getSearchRes(ev) {
        ev.preventDefault();
        axios.get("/getUsers", { params: { searchText, id } }).then((res) => {
            setSearchResult(res.data);
        }).catch((err) => {
            console.error(err);
        });
    }

    function sendRequest(userId) {
        axios.post("/sendRequest", { userId, id }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
    }

    function checkOnline(username) {
        return onlinePeople.hasOwnProperty(username);
    }
    let a=0;
    a++;

    return (
        <>
            <div className="flex items-center gap-2 pl-2 flex">
                <button onClick={getSearchRes}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>
                </button>
                <input type="text" placeholder="Search"
                    className="p-2 bg-gray-800 rounded-full text-white flex-grow-50"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <div>
                <div className="pl-6  my-2 py-3 border bg-gray-300">Search Result</div>
                {searchResult &&
                    Object.keys(searchResult).map((userId) => (
                        <>
                            <div
                                key={searchResult[userId]._id}
                                className={
                                    "border-b border-gray-100 flex items-center gap-2 cursor-pointer "
                                }
                            >
                                <div className="flex gap-2 py-2 pl-4 items-center">
                                    {checkOnline(searchResult[userId].username)}
                                    <Avatar
                                        userId={searchResult[userId]._id}
                                        username={searchResult[userId].username}
                                        online={checkOnline(searchResult[userId]._id)}
                                    />
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-800">{searchResult[userId].username}</span>
                                        <button onClick={() => sendRequest(searchResult[userId]._id)} className="rounded-full bg-blue-100 pl-1 pr-1">Send Request</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))}
            </div>
        </>
    )
}
