Messages = new Meteor.Collection("messages");
//Tags = new Meteor.Collection("tags");
Connections = new Meteor.Collection("connections");
Commands = new Meteor.Collection("commands");

if (Meteor.isClient) {

 Meteor.startup(function () {
    if (document.cookie !== undefined) {
      var cookieName = readCookie('magisknavn');
      if(cookieName !== null){
        document.getElementsByClassName('input-name')[0].value = cookieName;
      }
    }
  });

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

 var favIconStatus = 0;
 function changeFavicon(){
    if(document.getElementsByTagName('link').length > 2){
       document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('link')[2]);
    } 
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
     if(favIconStatus===0){ // default icon.
      link.href = 'favicon.ico';    
     } else if(favIconStatus===1){ // Someone talked.
       link.href = 'favicon-talked.ico'; 
     } else if(favIconStatus===2){ // Someone talked and mentioned you.
        link.href = 'favicon-talked-about-you.ico'; 
     }
    document.getElementsByTagName('head')[0].appendChild(link);
  }


  function replaceURLWithHTMLLinks(text){
        var exp = /((\b(https?|ftp|file):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        if(text.indexOf("www") !== -1 && text.indexOf("http") === -1){
            text = text.replace('www',"http://www"); 
        } 
        text = text.replace(exp,"<a href='$1' target='_new'>$1</a>");     
        
        return text;
  }

  Session.set("current_id","")
  if(Session.get("user_id") === undefined){
    var user_id = Connections.insert({name:'',last_seen: (new Date()).getTime()});;
    Session.set("user_id",user_id);
  }

  var counter;
  var onblurCount;
  window.onblur = function(event){
    onblurCount = Messages.find({}).count();
    counter = window.setInterval(function () {
      var nowCount = Messages.find({}).count();
      if(onblurCount !== undefined && (nowCount - onblurCount) > 0){
        var howMuch = nowCount - onblurCount;
        var nick = document.getElementsByClassName('input-name')[0].value.trim().toLowerCase();
        window.document.title = "Magisk ("+howMuch+")";          
          if(nick.length > 0 && favIconStatus !== 2){
            var talkedAboutYou = false;
            if(favIconStatus !== 2){
              Messages.find({},{sort: {date_created: -1},limit:howMuch}).forEach(
                function(msg){
                  if(msg.msgtxt.toLowerCase().indexOf(nick) !==-1){
                    console.log(msg.msgtxt.toLowerCase());
                    console.log(nick);
                    talkedAboutYou = true;
                  }
              });
            }
            if(talkedAboutYou){
              favIconStatus = 2;
              changeFavicon(); 
            }
          }
          
          if(favIconStatus === 0){
            favIconStatus = 1;
            changeFavicon(); 
          }
      }
    }, 5000);
  }

  window.onmousemove = function(event){
    if(counter !== undefined){
      window.clearInterval(counter);
      window.document.title = "Magisk";  
      favIconStatus=0;
      changeFavicon();
      counter = undefined;
      onblurCount= undefined;
    }
  }

    
  Meteor.setInterval(function () {
    Meteor.call('keepalive', Session.get('user_id'),document.getElementsByClassName('input-name')[0].value.trim());
    document.getElementsByClassName('num-connections')[0].innerHTML = Connections.find({}).count();
    var users = "";
    Connections.find({}).forEach(function(conn){console.log(conn.name);users += conn.name + " "});
    
    if(users.trim() !== ''){
      document.getElementsByClassName('connections')[0].innerHTML = 'Happy campers: ' + users;
    }
  }, 10000);

 
  Template.chat.messages = function () {
    return Messages.find({}, {sort: {date_created: -1}, limit:100});
  };

  Template.chat.events({
    'blur input.input-name' : function (event) {
        document.cookie ='magisknavn='+document.getElementsByClassName('input-name')[0].value+'; expires=Tue, 31 Dec 2013 20:00:00 UTC; path=/'
    },
    'keyup input.input-msg' : function (event) {
      if(counter !== undefined){
          window.clearInterval(counter);
          window.document.title = "Magisk";  
      }
        var n = document.getElementsByClassName('input-name')[0].value;
        var v = document.getElementsByClassName('input-msg')[0].value;
        var date = new Date();
        var dc = Date.parse(date);
      if(event.keyCode == 13){
        var msg = Messages.findOne(Session.get("current_id"));
        if(msg !== undefined ){
            
           if(n.length < 300 && v.length < 1000 && v.search(/<(script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){
            v=replaceURLWithHTMLLinks(v);
             var hours = date.getHours();
             if (hours < 10){
              hours = '0' + hours;
             } 
             var minutes = date.getMinutes();
             if (minutes < 10){
              minutes = '0' + minutes;
             } 
             var time = ""+hours+":"+minutes;
            Messages.update(Session.get("current_id"),{name:n, msgtxt: v, date_created:dc, time:time});
          }
        }
        document.getElementsByClassName('input-msg')[0].value = '';
        Session.set("current_id","");
      } else {
        if(document.getElementsByClassName('input-msg')[0].value.trim().length == 1 && Session.get("current_id").length == 0){
              var id = Messages.insert({name:n, msgtxt: v, date_created : dc});
              Session.set("current_id",id);
        } else {
              var msg = Messages.findOne(Session.get("current_id"));
              if(msg !== undefined && n.length < 300 && v.length < 1000 && v.search(/<(script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){
                  Messages.update(Session.get("current_id"),{name:n, msgtxt: v, date_created: msg.date_created});
              } else if(msg !== undefined) {
                Messages.remove(Session.get("current_id"));
              } else if(v.trim() !== '' && n.length < 300 && v.length < 1000 && v.search(/<(script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){
               var id = Messages.insert({name:n, msgtxt: v, date_created : dc});
               Session.set("current_id",id);
              }
        }

      }
    }

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  Meteor.methods({
    keepalive: function (user_id,nick) {
        Connections.update(user_id, {$set: {name:nick,last_seen: (new Date()).getTime()}});
    }
  });

  // server code: clean up dead clients after 60 seconds
  Meteor.setInterval(function () {
    var now = (new Date()).getTime();
    Connections.remove({last_seen: {$lt: (now - 60 * 1000)}})
  }, 30 * 1000);
  // server code : clean up old messages.
  Meteor.setInterval(function () {
    var now = (new Date()).getTime();
    Messages.remove({date_created: {$lt: (now - (30 * 60 * 60 * 1000))}});
  }, (60 * 60 * 1000));

}
