Messages = new Meteor.Collection("messages");
//Tags = new Meteor.Collection("tags");
Connections = new Meteor.Collection("connections");

if (Meteor.isClient) {
  Meteor.startup(function(){

  });
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
    console.log("Here we go");
    onblurCount = Messages.find({}).count();
    counter = window.setInterval(function () {
      if(onblurCount !== undefined && (Messages.find({}).count() - onblurCount) > 0){
        var howMuch = Messages.find({}).count() - onblurCount;
        window.document.title = "Magisk ("+howMuch+")";  
      }
    }, 5000);
  }

  window.onmousemove = function(event){
    window.clearInterval(counter);
    window.document.title = "Magisk";  
    counter = undefined;
    onblurCount= undefined;
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
           var hours = date.getHours();
           if (hours < 10){
            hours = '0' + hours;
           } 
           var minutes = date.getMinutes();
           if (minutes < 10){
            minutes = '0' + minutes;
           } 
           var time = ""+hours+":"+minutes;
           v = replaceURLWithHTMLLinks(v);
          Messages.update(Session.get("current_id"),{name:n, msgtxt: v, date_created:dc, time:time});
        }
        document.getElementsByClassName('input-msg')[0].value = '';
        Session.set("current_id","");
      } else {
        if(document.getElementsByClassName('input-msg')[0].value.trim().length == 1 && Session.get("current_id").length == 0){
            var id = Messages.insert({name:n, msgtxt: v, date_created : dc});
            Session.set("current_id",id);
        } else {
              var msg = Messages.findOne(Session.get("current_id"));
              if(msg !== undefined ){
                  Messages.update(Session.get("current_id"),{name:n, msgtxt: v, date_created: msg.date_created});
              } else {
               if(v.trim() !== ''){
               var id = Messages.insert({name:n, msgtxt: v, date_created : dc});
               Session.set("current_id",id);
               }
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
    Messages.remove({date_created: {$t: (now - (30 * 60 * 60 * 1000))}});
  }, (60 * 60 * 1000));

}
