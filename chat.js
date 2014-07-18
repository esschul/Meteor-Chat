Messages = new Meteor.Collection("messages");
Connections = new Meteor.Collection("connections");
Commands = new Meteor.Collection("commands");

if (Meteor.isClient) {
 Meteor.startup(function () {
    if (document.cookie !== undefined) {
      var cookieName = readCookie('magisknavn');
      if(cookieName !== null){
        if(document.getElementsByClassName('input-name').length != 0){
        document.getElementsByClassName('input-name')[0].value = cookieName;
        }
      }
    }
  });

  Session.set("current_id","");
  if(Session.get("user_id") === undefined){
    var user_id = Connections.insert({name:'',mail:'',last_seen: (new Date()).getTime(),lati:0,longi:0});;
    Session.set("user_id",user_id);
  }

Meteor.setInterval(
    function () {
      if(document.getElementsByClassName('input-name').length != 0) {
        var nick = document.getElementsByClassName('input-name')[0].value.toString().trim().toLowerCase();
          var messages = document.getElementsByClassName('message');
          for(var i=0; i<messages.length; i++) { 
            var text = messages[i].getElementsByClassName('text')[0];            
            textContent=text.innerHTML.toLowerCase();
            if(textContent.indexOf(nick) !== -1 || textContent.indexOf(" alle ") !== -1 || textContent.substring(0,4) === "alle"){
              messages[i].className='message highlight';
            }
          }
        }
}, 1000);

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
        new Audio('smb_coin.wav').play();
     }
    document.getElementsByTagName('head')[0].appendChild(link);
  }

 function replaceURLWithImgurLinks(text){
      if(text.indexOf("imgur.com")){
        if(text.indexOf("www") !== -1 && text.indexOf("http") === -1){
            text = text.replace('www',"http://www"); 
        } 
        var exp = /((\b(http?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        if(text.indexOf(".jpg") === -1 ){
          text =  text.replace(exp,"<img src='$1.jpg'/>");
          text =  text.replace("gallery/","");
        } else {
          return text.replace(exp,"<img src='$1'/>");
        }
        
      }
      return text;
  }

function replaceURLWithYoutube(text){
      if(text.indexOf("youtube.com") !== -1){
        if(text.indexOf("www") !== -1 && text.indexOf("http") === -1){
            text = text.replace('www',"http://www"); 
        } 
          var asdf = /v\=\w{1,}/.exec(text)
          console.log(asdf);
          return "<iframe width='560' height='315' src='//www.youtube.com/embed/" + asdf[0].replace("v=","") + "' frameborder='0' allowfullscreen></iframe>";
        }
        
      
      return text;
  }




 function replaceURLWithHTMLLinks(text){
        var exp = /((\b(https?|ftp|file):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        if(text.indexOf("www") !== -1 && text.indexOf("http") === -1){
            text = text.replace('www',"http://www"); 
        } 
        return  text.replace(exp,"<a href='$1' target='_new'>$1</a>");
  }


 function replaceSmileyWithImageOfSmiley(text){
        if(text.indexOf('>:(') !== -1) {text = text.replace('>:(','<span class="smiley smiley_9">&nbsp;</span>')}; 
        if(text.indexOf('3:)') !== -1) {text = text.replace('3:)','<span class="smiley smiley_12">&nbsp;</span>')}; 
        if(text.indexOf('O:)') !== -1) {text = text.replace('O:)','<span class="smiley smiley_15">&nbsp;</span>')}; 
        if(text.indexOf('>:o') !== -1) {text = text.replace('>:o','<span class="smiley smiley_21">&nbsp;</span>')}; 

        if(text.indexOf(':)') !== -1) {text = text.replace(':)','<span class="smiley smiley_1">&nbsp;</span>')}; 
        if(text.indexOf(':(') !== -1) {text = text.replace(':(','<span class="smiley smiley_2">&nbsp;</span>')}; 
        if(text.indexOf(':P') !== -1) {text = text.replace(':P','<span class="smiley smiley_3">&nbsp;</span>')}; 
        if(text.indexOf(':D') !== -1) {text = text.replace(':D','<span class="smiley smiley_4">&nbsp;</span>')}; 
        if(text.indexOf(':O') !== -1) {text = text.replace(':O','<span class="smiley smiley_5">&nbsp;</span>')}; 
        if(text.indexOf(';)') !== -1) {text = text.replace(';)','<span class="smiley smiley_6">&nbsp;</span>')}; 
        if(text.indexOf('8)') !== -1) {text = text.replace('8)','<span class="smiley smiley_7">&nbsp;</span>')}; 
        if(text.indexOf('8|') !== -1) {text = text.replace('8|','<span class="smiley smiley_8">&nbsp;</span>')}; 
        if(text.indexOf(':\\') !== -1) {text = text.replace(':\\','<span class="smiley smiley_10">&nbsp;</span>')}; 
        if(text.indexOf(':\'(') !== -1) {text = text.replace(':\'(','<span class="smiley smiley_11">&nbsp;</span>')}; 
        if(text.indexOf('(^^^)') !== -1) {text = text.replace('(^^^)','<span class="smiley smiley_13">&nbsp;</span>')}; 
        if(text.indexOf('<(")') !== -1) {text = text.replace('<(")','<span class="smiley smiley_14">&nbsp;</span>')}; 
        if(text.indexOf(':-*') !== -1) {text = text.replace(':-*','<span class="smiley smiley_16">&nbsp;</span>')}; 
        if(text.indexOf('<3') !== -1) {text = text.replace('<3','<span class="smiley smiley_17">&nbsp;</span>')}; 
        if(text.indexOf('^_^') !== -1) {text = text.replace('^_^','<span class="smiley smiley_18">&nbsp;</span>')}; 
        if(text.indexOf('-_-') !== -1) {text = text.replace('-_-','<span class="smiley smiley_19">&nbsp;</span>')}; 
        if(text.indexOf('O.o') !== -1) {text = text.replace('O.o','<span class="smiley smiley_20">&nbsp;</span>')}; 
        if(text.indexOf(':v') !== -1) {text = text.replace(':v','<span class="smiley smiley_22">&nbsp;</span>')}; 
        if(text.indexOf(':3') !== -1) {text = text.replace(':3','<span class="smiley smiley_23">&nbsp;</span>')}; 
        if(text.indexOf(':|]') !== -1) {text = text.replace(':|]','<span class="smiley smiley_24">&nbsp;</span>')}; 
        if(text.indexOf(':putnam:') !== -1) {text = text.replace(':putnam:','<span class="smiley smiley_25">&nbsp;</span>')}; 
        if(text.indexOf(':42:') !== -1) {text = text.replace(':42:','<span class="smiley smiley_26">&nbsp;</span>')}; 
        if(text.indexOf('(y)') !== -1) {text = text.replace('(y)','<span class="smiley smiley_27">&nbsp;</span>')}; 


        if(text.toLowerCase().indexOf('andreas') !== -1) {text = text.replace(/[Aa]ndreas/g,'<span class="smiley andreas">&nbsp;</span>')}; 
        if(text.toLowerCase().indexOf('marius') !== -1) {text = text.replace(/[Mm]arius/g,'<span class="smiley marius">&nbsp;</span>')}; 
        if(text.toLowerCase().indexOf('espen') !== -1) {text = text.replace(/[Ee]spen/g,'<span class="smiley espen">&nbsp;</span>')}; 
        if(text.toLowerCase().indexOf('ballong') !== -1) {text = text.replace(/[Bb]allong/g,'<span class="smiley ballong">&nbsp;</span>')}; 
        if(text.toLowerCase().indexOf('bolle') !== -1) {text = text.replace(/[Bb]olle/g,'<span class="smiley bolle">&nbsp;</span>')}; 


        return  text;

  }



var latitude = 0;
var longitude = 0;

var beforeCnt = 0;

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
    if(counter !== undefined || favIconStatus !== 0){
      window.clearInterval(counter);
      window.document.title = "Magisk";  
      favIconStatus=0;
      changeFavicon();
      counter = undefined;
      onblurCount= undefined;
    }
  }

  Meteor.setInterval(function () {
    Meteor.call('keepalive', Session.get('user_id'),document.getElementsByClassName('input-name')[0].value.trim(),latitude,longitude);
    var users = "";
    Connections.find({}).forEach(function(conn){users += conn.name + " "});
    if(users.trim() !== ''){
      document.getElementsByClassName('connections')[0].innerHTML = 'Brukere : ' + users;
    }
  }, 10000);
 
  Template.chat.messages = function () {
    return Messages.find({}, {sort: {date_created: -1}, limit:15});
    
  };

  Template.chat.events({
    'blur input.input-name' : function (event) {
        if(document.getElementsByClassName('input-name').length != 0 && document.getElementsByClassName('input-name')[0].value.length > 20 ){
          document.getElementsByClassName('input-name')[0].value = document.getElementsByClassName('input-name')[0].value.substring(0,20)
        } 
        document.cookie ='magisknavn='+document.getElementsByClassName('input-name')[0].value+'; expires=Tue, 31 Dec 2015 20:00:00 UTC; path=/'
    },
    'keyup input.input-msg' : function (event) {
      if(counter !== undefined){
          window.clearInterval(counter);
          window.document.title = "Magisk";  
      }
        var n = document.getElementsByClassName('input-name')[0].value;
        var v = document.getElementsByClassName('input-msg')[0].value;

      if(event.keyCode == 13){
        var msg = Messages.findOne(Session.get("current_id"));
        if(msg !== undefined ){
           if(n.length < 300 && v.length < 1000 && v.search(/<(style|script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){
            
            if(v.indexOf("imgur") !== -1){
              v=replaceURLWithImgurLinks(v);
            } else if(v.indexOf("youtube.com" !== -1)) {
                v=replaceURLWithYoutube(v);
            } else {
                v=replaceURLWithHTMLLinks(v);
            }
            v=replaceSmileyWithImageOfSmiley(v);
            Meteor.call('msg_update', Session.get("current_id"),n, v);
          }
        }
        document.getElementsByClassName('input-msg')[0].value = '';
        Session.set("current_id","");
      } else {
        if(document.getElementsByClassName('input-msg')[0].value.trim().length == 1 && Session.get("current_id").length == 0){

              var id = Messages.insert({name:n, msgtxt: v,date_created:(new Date().getTime() + (220*60*1000) - 3600),time:''});
              Session.set("current_id",id);
        } else {
              var msg = Messages.findOne(Session.get("current_id"));
              if(msg !== undefined && n.length < 300 && v.length < 1000 && v.search(/<(style|script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){

                Messages.update(Session.get("current_id"),{name:n, msgtxt: v,date_created:(new Date().getTime() + (220*60*1000) - 3600)});
              } else if(msg !== undefined) {
                Messages.remove(Session.get("current_id"));
              } else if(v.trim() !== '' && n.length < 300 && v.length < 1000 && v.search(/<(style|script|object|applet|embbed|frameset|iframe|form|textarea|input|button)/) === -1){

                  var id = Messages.insert({name:n, msgtxt: v,date_created:(new Date().getTime() + (220*60*1000) - 3600),time:''});
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
    keepalive: function (user_id,nick,lati,longi) {
        Connections.update(user_id, {$set: {name:nick,last_seen: (new Date()).getTime(),lati:lati,longi:longi}});
    },
    msg_update: function (current_id, n, v) {
        var date = new Date();
        var dc = Date.parse(date);
        var hours = date.getHours();
        hours = hours + 2
        if (hours < 10){
          hours = '0' + hours;
        } 
        var minutes = date.getMinutes();
        if (minutes < 10){
          minutes = '0' + minutes;
        } 
          var time = ""+hours+":"+minutes;
          Messages.update(current_id,{name:n, msgtxt: v, date_created:dc+(120*60*1000), time:time});
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
  // Clean up messages without timestamp
  Meteor.setInterval(function () {
    var now = (new Date()).getTime();
    Messages.remove({date_created: {$lt: (now - (4 * 60 * 1000))},time: undefined});
  }, (60 * 1000));
}
