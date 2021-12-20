const express = require("express");
const http = require("http");
const { PORT } = require("./config");
const { Server } = require("socket.io");
const route = require("./route");
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

server.listen(PORT, console.log(`SERVER READY`));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
    "/bootstrap",
    express.static(
        path.join(__dirname, "..", "node_modules", "bootstrap", "dist")
    )
);

app.use(
    "/socket",
    express.static(
        path.join(__dirname, "..", "node_modules", "socket.io", "client-dist")
    )
);

app.use(
    "/peerjs",
    express.static(path.join(__dirname, "..", "node_modules", "peerjs", "dist"))
);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", route);

const data = [];

io.on("connection", (socket) => {
    let user = data.find((e) => e.id == socket.id);
    if (!user) {
        user = {
            id: socket.id,
        };

        data.push(user);
    }
    let users = [...data];
    users.splice(
        data.findIndex((e) => e.id == user.id),
        1
    );

    socket.emit("ulanish", data);
    socket.broadcast.emit("ulanish", data);
    // socket.on("ulanish", (e) => {
    //     let users = [...data];
    //     users.splice(
    //         data.findIndex((e) => e.id == user.id),
    //         1
    //     );
    //     socket.emit("ulanish", users);
    // });

    socket.on("peer", (el) => {
        let userIndex = data.findIndex((e) => e.id == el.socket_id);
        if (userIndex) {
            data[userIndex].peer_id = el.peer_id;
        }
    });

    socket.on("call", (id) => {
        socket.to(id).emit("call", user);
    });

    socket.on("disconnect", () => {
        let userIndex = data.findIndex((e) => e.id == socket.id);
        if (userIndex > -1) {
            data.splice(userIndex, 1);
        }
        socket.emit("ulanish", data);
    });
});
