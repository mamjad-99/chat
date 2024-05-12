const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Message = require("./models/Message");
const User = require("./models/User");
const Request = require("./models/Requests");
const Friends = require("./models/friends");
const ws = require("ws");
const fs = require("fs");
const path = require('path');


dotenv.config();

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log("DB connected successfully");
});
const jwtScrete = process.env.JWT_SCRETE;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/export", express.static(__dirname + "/export"));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtScrete, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/people", async (req, res) => {
  const { id } = req.query;
  try {
    const friends = await Friends.find({ myId: id });
    const friendIds = friends.map((friend) => friend.myFriendId);
    const users = await User.find(
      { _id: { $in: friendIds } },
      { _id: 1, username: 1 }
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtScrete, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    //401 unauthorized
    res.status(401).json("No Token");
  }
});
app.post("/acceptRequest", async (req, res) => {
  const { id, userId } = req.body;
  await Friends.create({
    myId: id,
    myFriendId: userId,
  });
  await Friends.create({
    myId: userId,
    myFriendId: id,
  });
  await Request.findOneAndDelete({
    requestSender: userId,
    requestReceiver: id,
  });
  res.json("ok");
});
app.post("/deleteRequest", async (req, res) => {
  const { id, userId } = req.body;
  const deleteRequest = await Request.findOneAndDelete({
    requestSender: userId,
    requestReceiver: id,
  });
  res.json("ok");
});
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const message = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });

  res.json(message);
});

const checkPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

app.get("/getUsers", async (req, res) => {
  const searchText = req.query.searchText;
  const id = req.query.id;
  const regex = new RegExp(searchText, "i");
  const users = await User.find({
    username: regex,
    _id: { $ne: id }, // Exclude the user with the specified ID
  });

  res.json(users);
});
app.get("/getRequest", async (req, res) => {
  const id = req.query.id;
  const requests = await Request.find({ requestReceiver: id })
    .populate("requestSender", "username")
    .populate("requestReceiver", "username");
  res.json(requests);
});

app.post("/sendRequest", async (req, res) => {
  const requestReceiver = req.body.userId;
  const requestSender = req.body.id;
  try {
    const checkExisting = await Request.findOne({
      $or: [
        { requestSender: requestSender, requestReceiver: requestReceiver },
        { requestSender: requestReceiver, requestReceiver: requestSender },
      ],
    });

    if (!checkExisting) {
      const sendRequest = await Request.create({
        requestSender,
        requestReceiver,
      });
      res.status(200).json({
        status: "ok",
        message: "Request Sent",
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Request already sent",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = await checkPassword(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtScrete,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(201)
            .json({
              id: foundUser._id,
              username,
            });
        }
      );
    }
  } else {
    res.status(404).json({
      status: "error",
      message: "user not found",
    });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});
app.post("/deleteUser", async (req, res) => {
  const { id, userId } = req.body;
  try {
    await Friends.findOneAndDelete({
      myId: id,
      myFriendId: userId,
    });
    await Friends.findOneAndDelete({
      myId: userId,
      myFriendId: id,
    });
    res.json("ok");
  } catch (err) {
    res.json({
      status: "error",
    });
  }
});

app.get("/getLastMessage", async (req, res) => {
  const { id, selectedUserId } = req.query;
  try {
    const lastMessage = await Message.findOne({
      $or: [
        { sender: id, recipient: selectedUserId },
        { recipient: id, sender: selectedUserId },
      ]
    }).sort({ createdAt: -1 }); // Sort in descending order to get the last message
    res.json(lastMessage)[0];
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



app.post("/deleteChat", async (req, res) => {
  const { id, userId } = req.body;
  try {
    await Message.findAndDelete({
      sender: id,
      recipient: userId,
    });
    await Message.findAndDelete({
      recipient: userId,
      sender: id,
    });
    res.json("ok");
  } catch (err) {
    res.json({
      status: "error",
    });
  }
});

app.get("/searchMessage", async (req, res) => {
  const { id, selectedUserId, searchMessage } = req.query;
  try {
    const message = await Message.find({
      $or: [
        { sender: id, recipient: selectedUserId },
        { recipient: id, sender: selectedUserId },
      ],
    }).sort({ createdAt: 1 });

    const regex = new RegExp(searchMessage, "i");
    const result = message.filter((msg) => regex.test(msg.text));

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      const createUser = await User.create({
        username,
        password: hashedPassword,
      });

      jwt.sign(
        { userId: createUser._id, username },
        jwtScrete,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(201)
            .json({
              id: createUser._id,
              username,
            });
        }
      );
    }
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});


app.post("/export", async (req, res) => {
  const { id, myId } = req.body;
  console.log(id,myId)
  try {
    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: id },
        { sender: id, recipient: myId },
      ],
    });

    const chatContent = messages.map((message) => {
      return `${message.createdAt} - ${message.sender}: ${message.text}\n`;
    }).join("");

    const exportPath = path.join(__dirname, "export", `${myId}_${id}_chat.txt`);
    console.log("path :",exportPath)
    fs.writeFile(exportPath, chatContent, (err) => {
      if (err) {
        console.error("Error exporting chat:", err);
        return res.status(500).json({ message: "Server Error" });
      }
      console.log("Chat exported successfully");
      res.sendStatus(200);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // read username and id form the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtScrete, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + filename;
      const bufferData = new Buffer(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file saved:");
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? filename : null,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});
