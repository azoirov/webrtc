const socket = io();

const usersListElement = document.querySelector("ul.users-list");
const myVideoChat = document.querySelector(".myVideoChat");
const partnerVideoChat = document.querySelector(".partnerVideoChat");
const myVideoElement = myVideoChat.querySelector("video");
const partnerVideoElement = partnerVideoChat.querySelector("video");
let userItems = document.querySelectorAll("li.user-item");

socket.on("ulanish", async (users) => {
    usersListElement.innerHTML = "";
    users.forEach((user) => {
        usersListElement.innerHTML += `<li class="list-group-item user-item">${user.id}</li>`;
    });
    userItems = document.querySelectorAll("li.user-item");
    userItemsClick();
    let myVideo = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
        peerIdentity: true,
    });

    myVideoElement.srcObject = myVideo;
});

socket.on("call", async (user) => {
    console.log(user);
    let stream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
        peerIdentity: true,
    });
    let call = peer.call(user.peer_id, stream);
    call.on("stream", (remoteStream) => {
        partnerVideoElement.srcObject = remoteStream;
    });
});

function userItemsClick() {
    userItems.forEach((user) => {
        user.addEventListener("click", (e) => {
            let id = user.textContent;
            socket.emit("call", id);
        });
    });
}
userItemsClick();
const peer = new Peer();

peer.on("open", (id) => {
    socket.emit("peer", {
        socket_id: socket.id,
        peer_id: id,
    });
});

peer.on("call", async (call) => {
    let stream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
        peerIdentity: true,
    });
    call.answer(stream);
    call.on("stream", (remoteStream) => {
        partnerVideoElement.srcObject = remoteStream;
    });
});
