const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.set("view engine", "ejs")
server = app.listen(3000)
const io = require("socket.io")(server)

//middlewares
app.use(express.static("public"))

//routes
app.get("/", function(req, res){
	res.render("index")
})

app.use(bodyParser.urlencoded({extended: false}))
app.post("/lobby", function(req, res){
    res.render("lobby",{
        seat: req.body.seat,
        username: req.body.username
    })
})

app.get("/chatroom", function(req, res){
    console.log("get is processing")
    res.render("chatroom", {
        chatroom: req.body.chatroom
    })
})

var exist_user = [];
var clients = [];

//all sockets event
io.on("connection", function(socket) {
    
    socket.on("new_user", function(data){
        socket.username = data.username
        socket.seat = data.seat
        exist_user.push({
            "seat": socket.seat,
            "username": socket.username,
            "socket": socket.id
        })
        clients[socket.id] = socket
        console.log("Socket joined:" + socket.username)
        io.sockets.emit("update_lobby", {users: exist_user})
    })

    //create chatroom
    socket.on("cr_chatrm", function(data){
        //need to make function of invitation and accept invitation
        var tar_socket;
        
        socket.join(data.chatrm)
        for (i in exist_user){
            if(exist_user[i].username == data.username){
                tar_socket = exist_user[i]
                console.log("Found socket: "+ tar_socket.socket)
                clients[tar_socket.socket].join(data.chatrm)
                io.to(data.chatrm).emit("chatrm_created", {chatrm: data.chatrm})
                break
            }
        }
        console.log("Chatrm created: " + data.chatrm)
    })

    //listen on send_message
    socket.on("send_msg", function(data){
        console.log("public")
        io.sockets.emit("new_msg", {username: socket.username, msg: data.msg})
    })

    //listen on private chatrm
    socket.on("send_msg_chtrm", function(data){
        console.log("Chatrm")
        io.to(data.chatrm_no).emit("chatrm_new_msg", {username: socket.username, msg: data.msg})
    })

    //listen on typing
    socket.on("typing", function(){
        socket.broadcast.emit("rec_typing", {username: socket.username})
    })

    socket.on("fin_typing", function(){
        socket.broadcast.emit("fin_typing", {username: socket.username})
    })

    socket.on("disconnect", function(){
        delete clients[socket.id]
        for (i in exist_user) {
            if (exist_user[i].username == socket.username){
                exist_user.splice(i,1)
                break
            }
        }
        console.log("Socket Left:" + socket.username)
        socket.broadcast.emit("update_lobby", {users: exist_user})
    })
})