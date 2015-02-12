var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function (req, res, next) {
    res.sendFile(__dirname + "/index.html");
});
// key is email id
// userInfo and socket
var socketMap = {};

io.on("connection", function (socket) {
    console.log("A new connection established");
    var userEmail;
    var userName;
    socket.on("new-user", function(data){
        var email = data.email.trim();
        if(!socketMap[email]){
            socketMap[email] = {userInfo:{}}
        }
        userEmail = email;
        userName = data.name;
        socketMap[email] = {
            userInfo: {
                name:data.name,
                email:data.email
            },
            socket: socket
        };

        var userList = [];
        for(var key in socketMap){
            if(key == data.email)
                continue;
            userList.push(socketMap[key].userInfo);
        }
        socket.emit("authenticated", {data: userList});

    });

    socket.on("new-chat", function(data){
        var friendRecord = socketMap[data["friend-email"]];
        friendRecord.socket.emit("new-message", {from:userName, message:data.message});
    });

    socket.on("message", function(data){
        socket.emit("reply", {data:"Got your message \'"+ data.data + "\'"})
    });
    socket.on("error", function(err){
        console.log(err);
    });
    socket.on("close", function(){
        delete socketMap[userEmail]
    });
});

console.log("Starting server");
http.listen(3300);