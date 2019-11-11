$(function(){
    var userlist = ["Haha7531", "Bang", "Damn", "On99", "Lucas"]
    
    var user_status = ["Online", "Offline", "N/A"]
    var msg = $("#message")
    var seat = $("#seatid").text()
    var username = $("#usernameid").text()
    var send_msg = $("#send_message")
    var chtrm_send_msg = $("#send_message1")
    var extusers = $("#extusers")
    var chatroom = $("#chatroom")
    var pm_chatroom = $("#chatroom1")
    var feedback = $("#feedback")
    
    var chatrm_no = 1
    
    //make connection
    var socket = io.connect('http://localhost:3000')

    //make lobby
    for (i in userlist){
        extusers.append("<button class='users' id='" + userlist[i] + "'name='chatrm'></button>")
    }

    //chat with selected users
    $(document).on("click", "button[class='users']", function(e){
        _username = $(this).attr("value").split(/(\s+)/)[0]
        _status = $(this).attr("value").split(/(\s+)/)[2]
        if(_status != user_status[0]){
            alert("He is not available")
            e.preventDefault()
        }
        else{
            socket.emit("cr_chatrm", {username:_username, chatrm: chatrm_no})
            //create chatroom
            socket.on("chatrm_created", function(data){
                console.log("Created chatrm")
                $(this).val(data.chatrm)
            })
            chatrm_no ++ 
        }
    })

    // send msg
    send_msg.click(function(){
        socket.emit("send_msg", {msg: msg.val()})
        msg.val('')
    })
    chtrm_send_msg.click(function(){
        var _chatrm = pm_chatroom.attr("name")
        console.log(_chatrm)
        socket.emit("chtrm_send_msg", {msg: msg.val(), chatrm_no: _chatrm})
        msg.val('')
    })

    //typing noti
    msg.on("input", function(){
        socket.emit("typing")
    })
    msg.on("keyup", function(){
        socket.emit("fin_typing")
    })
    socket.on("rec_typing", function(data){
        feedback.html("<p><i>" + data.username + " is typing ......" + "</i></p>")
    })
    socket.on("fin_typing", function(){
        feedback.empty()
    })

    //when connected
    socket.on("connect", function(){
        socket.emit("new_user", {seat: seat, username: username})
    })

    //send new msg
    socket.on("new_msg", function(data){
        chatroom.append("<p class='message'>" + data.username + ": " + data.msg + "</p>")
    })

    //send new msg in chatrm
    socket.on("chatrm_new_msg", function(data){
        pm_chatroom.append("<p class='message'>" + data.username + ": " + data.msg + "</p>")
    })
    
    //updates lobby
    socket.on("update_lobby", function(data){
        if (data != null){
            var users = data.users
            $("#"+username).hide()
            for(i in userlist){
                for (y in users){
                    if (userlist[i] == users[y].username){
                        $("#"+userlist[i]).val(userlist[i] + " " + user_status[0])
                        $("#"+userlist[i]).html(userlist[i] + "<br>" + " green")
                        break
                    }
                    else{
                        $("#"+userlist[i]).val(userlist[i] + " " + user_status[1])
                        $("#"+userlist[i]).html(userlist[i] + "<br>" +" red")
                    }
                }
            }
        }
        else{
            console.log("No user online")
        }
    })
    
});