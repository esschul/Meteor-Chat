Messages = new Meteor.Collection("messages");
//Tags = new Meteor.Collection("tags");
Connections = new Meteor.Collection("connections");

if (Meteor.isClient) {
 var favIconStatus = 0;
 function changeFavicon(){
    if(document.getElementsByTagName('link').length > 1){
       document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('link')[1]);
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
        text = text.replace(exp,"<a href='$1' target='_new'>$1</a>"); 
        if(text.indexOf("www") !== -1 && text.indexOf("http") === -1){
            text = text.replace('www',"http://www"); 
        } 
        return text;
  }

  Session.set("current_id","")
  if(Session.get("user_id") === undefined){
    var user_id = Connections.insert({last_seen: (new Date()).getTime()});;
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
    Meteor.call('keepalive', Session.get('user_id'));
    document.getElementsByClassName('num-connections')[0].innerHTML = Connections.find({}).count();
  }, 10000);

 
  Template.chat.messages = function () {
    return Messages.find({}, {sort: {date_created: -1}, limit:100});
  };

  Template.chat.events({
    'keyup input' : function (event) {
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
           v=replaceURLWithHTMLLinks(v);
           if(n.length < 300 && v.length < 1000 && v.search(/<(script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){
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
    //, 'keyup input.tags' : function(event){
    //    if(document.getElementsByClassName('tags') !== undefined && document.getElementsByClassName('tags')[0].value.trim().length > 2){
    //      document.getElementsByClassName('tags')[0].value
    //    }
    //}

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  Meteor.methods({
    keepalive: function (user_id) {
        Connections.update(user_id, {$set: {last_seen: (new Date()).getTime()}});
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
