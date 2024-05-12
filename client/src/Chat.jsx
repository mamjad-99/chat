import { useContext, useEffect, useRef, useState } from "react";
import logoWhisprr from "./assets/Images/whisprr.ico";
import logo from "./assets/Images/logow.ico";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";
import SearchRes from "./SearchRes";
import Request from "./Request";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [chatOrRequest, setChatOrRequest] = useState("chat");
  const [onlineFriends, setOnlineFriends] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState({});
  const [searchMessage, setSearchMessage] = useState({});

  const { username, id, setId, setUsername } = useContext(UserContext);

  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:3000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => [...prev, { ...messageData }]);
      }
    }
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ username, userId }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      axios.get("/messages/" + selectedUserId).then(res => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText('');
      setMessages(prev => [...prev, {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      }]);
    }
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  function searchFirstMessage(ev){
    ev.preventDefault();
    axios.get()
  }

  function getSearchRes(ev) {
    ev.preventDefault();
    axios.get("/getFriends", { params: { searchText, id } }).then((res) => {
      setSearchResult(res.data);
    }).catch((err) => {
      console.error(err);
    });
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then(res => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    axios.get('/people', { params: { id } }).then(res => {
      const friendsList = res.data;
      const onlineFriends = friendsList.filter(friend => onlinePeople[friend._id]);
      const offlineFriends = friendsList.filter(friend => !onlinePeople[friend._id]);
      setOnlineFriends(onlineFriends.reduce((acc, friend) => ({ ...acc, [friend._id]: friend }), {}));
      setOfflinePeople(offlineFriends.reduce((acc, friend) => ({ ...acc, [friend._id]: friend }), {}));
    });
  }, [onlinePeople]);

  const messagesWithoutDup = uniqBy(messages, "_id");

  const deleteUser = (userId) => {
    axios.post('/deleteUser', { id, userId }).then(() => {
      setSelectedUserId(null);
    });
  };

  const deleteChat = (userId) => {
    axios.post('/deleteChat', { id, userId }).then(() => {
      setMessages([]);
    });
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="bg-white-100 w-1/3 flex flex-col">
          {chatOrRequest === "chat" ? (
            <div className="flex-grow">
              <div className="text-blue-700 font-bold flex p-4">
                <img src={logo} alt="Whispr Logo" width="70" height="50" className="mr-2" />
                <span className="p-5">Whispr</span>
              </div>
              <div className="p-2 pl-4 border bg-gray-400 text-red-600 font-bold ">Contacts</div>
              <div className="flex items-center gap-2 pl-2 my-3">
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
              {Object.keys(onlineFriends).map(userId => (
                <Contact
                  key={userId}
                  id={userId}
                  username={onlineFriends[userId].username}
                  onClick={() => setSelectedUserId(userId)}
                  selected={userId === selectedUserId}
                  online={true}
                  onDeleteUser={deleteUser}
                  onDeleteChat={deleteChat}
                />

              ))}
              {Object.keys(offlinePeople).map(userId => (
                <Contact
                  key={userId}
                  id={userId}
                  online={false}
                  username={offlinePeople[userId].username}
                  onClick={() => setSelectedUserId(userId)}
                  selected={userId === selectedUserId}
                  onDeleteUser={deleteUser}
                  onDeleteChat={deleteChat}
                />
              ))}
            </div>
          ) : (
            <div className="flex-grow">
              <div className="text-blue-700 font-bold flex p-4">
                <img src={logo} alt="Whispr Logo" width="70" height="50" className="mr-2" />
                <span className="p-5">Whispr</span>
              </div>
              <div>
                <SearchRes
                  key={id}
                  id={id}
                  onlinePeople={onlineFriends}
                  myname={username}
                />
              </div>
              <div>
                <Request
                  key={id}
                  id={id}
                  onlinePeople={onlineFriends}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pl-6 items-center">
            <div className="p-2 text-center">
              <button
                onClick={logout}
                className="text-sm text-gray-500 bg-blue-200 py-1 px-2 border rounded-md"
              >
                Logout
              </button>
            </div>
            <div className="p-2 text-center">
              <button
                onClick={() => setChatOrRequest(chatOrRequest === "chat" ? "request" : "chat")}
                className="text-sm text-gray-500 bg-blue-200 py-1 px-2 border rounded-md"
              >
                {chatOrRequest === "chat" ? "Request" : "Chat"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-blue-100 w-2/3 p-2">
          <div className="flex-grow flex flex-col items-center justify-center">
            {!selectedUserId && (
              <>
                <img className="w-40 h-40 mb-4" src={logoWhisprr} alt="Whispr Logo" />
                <div className="text-gray-400">&larr; Select a person from the sidebar</div>
              </>
            )}
          </div>
          <div className="relative h-full">
            {!!selectedUserId && (
              <div className="overflow-y-scroll overflow-x-hidden absolute top-0 right-0 left-0 bottom-2">
                {messagesWithoutDup.map(message => (
                  <div key={message._id} className={(message.sender === id ? "justify-end" : "justify-start") + " flex"}>
                    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? ' bg-blue-500 text-white ' : " bg-white text-gray-500 ")}>
                      {message.text}
                      {message.file && (
                        <div className="my-2">
                          <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 1 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            )}
          </div>
          {!!selectedUserId && (
            <>
              <div className="p-2 w-full flex items-center ">

                <button onClick={searchFirstMessage} className="bg-blue-500 p-2 text-white rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                  </svg>
                </button>
                <input type="text" placeholder="Search" className="h-10 p-2 w-full"
                  value={searchMessage}
                  onChange={ev => setSearchMessage(ev.target.value)}
                />
              </div>
              <form className="flex gap-2" onSubmit={sendMessage}>
                <input type="text" value={newMessageText}
                  onChange={ev => setNewMessageText(ev.target.value)}
                  className="bg-white flex-grow border rounded-md p-2"
                  placeholder="Type your message here" />
                <label type="button" className="bg-gray-200 cursor-pointer p-2 text-gray-700 rounded-md border border-gray-500">
                  <input type="file" className="hidden" onChange={sendFile} />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 1 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                  </svg>
                </label>
                <button type="submit" className="bg-blue-500 p-2 text-white rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
