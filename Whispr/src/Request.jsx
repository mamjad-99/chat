// import { useEffect, useState } from "react";
// import Avatar from "./Avatar.jsx";
// import axios from "axios";

// export default function Request({ id, onlinePeople }) {
//     const [requestResult, setRequestResult] = useState({});

//     useEffect(() => {
//         console.log("UserId : ", id);
//         axios.get("/getRequest", { params: { id } })
//              .then((res) => {
//                 setRequestResult(res.data);
//                 console.log("Request data :", res.data);
//              })
//              .catch((err) => {
//                 console.error(err);
//              });
//     }, []);


//     function acceptRequest(userId) {
//         console.log(userId, id)
//         axios.post("/acceptRequest", { params: { userId, id } }).then((res) => {
//             console.log(res.data);
//         }).catch((err) => {
//             console.error(err);
//         });
//     }
//     function deleteRequest(userId) {
//         console.log(userId, id)
//         axios.post("/deleteRequest", { params: { userId, id } }).then((res) => {
//             console.log(res.data);
//         }).catch((err) => {
//             console.error(err);
//         });
//     }

//     function checkOnline(username) {
//         return onlinePeople.hasOwnProperty(username);
//     }

//     return (
//         <>
//             <div>
//             <div className="pl-6  my-2 py-3 border bg-gray-300">Friend Requests</div>
//                 {requestResult &&
//                     Object.keys(requestResult).map((userId) => (
//                         <>
//                             <div
//                                 key={requestResult[userId]._id}
//                                 className={
//                                     "border-b border-gray-100 flex items-center gap-2 cursor-pointer "
//                                 }
//                             >
//                                 <div className="flex gap-2 py-2 pl-4 items-center">
//                                     {checkOnline(requestResult[userId].username)}
//                                     <Avatar
//                                         userId={requestResult[userId]._id}
//                                         username={requestResult[userId].username}
//                                         online={checkOnline(requestResult[userId]._id)}
//                                     />
//                                     <div className="flex items-center gap-4">
//                                         <span className="text-gray-800">{requestResult[userId].username}</span>
//                                         <button onClick={() => acceptRequest(requestResult[userId]._id)} className="rounded-full bg-blue-100 pl-1 pr-1">Accept Request</button>
//                                         <button onClick={() => deleteRequest(requestResult[userId]._id)} className="rounded-full bg-blue-100 pl-1 pr-1">Delete Request</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </>
//                     ))}

//             </div>
//         </>
//     )
// }


import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";
import axios from "axios";

export default function Request({ id, onlinePeople }) {
    const [requestResult, setRequestResult] = useState([]);

    useEffect(() => {
        console.log("UserId : ", id);
        axios.get("/getRequest", { params: { id: id } }) // Pass id inside an object with a key `id`
            .then((res) => {
                setRequestResult(res.data);
                console.log("Request data :", res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);


    function acceptRequest(userId) {
        console.log(userId, id)

        axios.post("/acceptRequest", { id, userId }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
    }
    function deleteRequest(userId) {
        console.log(userId, id);

        axios
            .post("/deleteRequest", { id, userId })
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }


    function checkOnline(username) {
        return onlinePeople.hasOwnProperty(username);
    }

    return (
        <>
            <div>
                <div className="pl-6  my-2 py-3 border bg-gray-300">Friend Requests</div>
                {requestResult &&
                    requestResult.map((request) => (
                        <div
                            key={request._id}
                            className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer "}
                        >
                            <div className="flex gap-2 py-2 pl-4 items-center">
                                {checkOnline(request.requestReceiver.username)}
                                <Avatar
                                    userId={request.requestSender._id}
                                    username={request.requestSender.username} // Pass the username as a prop
                                    online={checkOnline(request.requestSender._id)}
                                />
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-800">{request.requestSender.username}</span>
                                    <button onClick={() => acceptRequest(request.requestSender._id)} className="rounded-full bg-blue-100 pl-1 pr-1">Accept Request</button>
                                    <button onClick={() => deleteRequest(request.requestSender._id)} className="rounded-full bg-blue-100 pl-1 pr-1">Delete Request</button>
                                </div>
                            </div>
                        </div>
                    ))}

            </div>
        </>
    )
}
