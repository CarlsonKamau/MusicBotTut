const Discord = require ("discord.js");
const client = new Discord.Client();
const ytdl = require ("ytdl-core");
const request = require ("request");
const fs = require ("fs");
const getYoutubeID = require ("get-youtube-id");
const fetchVideoInfo = require("youtube-info");

var config = JSON.parse(fs.readFileSync('./settings.json','utf-8'));

const yt_api_key=config.yt_api_key;
const bot_controller =config.bot_controller;
const prefix =config.prefix;
const discord_token=config.discord_token;

var queue =[];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var skipReq =0;
var skippers= [];

client.login(discord_token);

client.on('message',function(message){
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args =message.content.split('').slice(1).join("");

    if (mess.startsWith(prefix +"play")) {
      if (queue.length > 0 || isPlaying){
        getID(args,function(id){
          add_to_queue(id);
          fetchVideoInfo(id,function(err,videoInfo){
            if(err) throw new Error(err);
            message.reply(" added to queue **" +videoInfo.title +"**");
          });
        });
      }else {
        isPlaying = true;
        getID(args,function(id){
          queue.push("placeholder");
          playMusic(id,message);
          fetchVideoInfo(id,function(err,videoInfo){
            if(err) throw new Error(err);
            message.reply("now playing **" +videoInfo.title +"**");
          });
      });
      }
    }
});



client.on('ready',function(){
    console.log("i am ready!");
});


function playMusic(id, messages){
  voiceChannel = message.member.voiceChannel;

  voiceChannel.join().then(function(connection){
    stream = ytdl("https://www.youtube.com/watch?v=" + id,{
      filter: 'audioonly'
    });
    skipReq = 0;
    skippers= [];

    dispatcher = connection.playstream(stream);
  });
}

function getID (str,cb){
  if(isYoutube(str)){
    cb(getYoutubeID(str));
  }
    else{
      search_video(str,function(id) {
        cb(id);
      });

    }
  }


function add_to_queue(strID){
  if(isYoutube(strID)){
    queue.push(getYoutubeID(strID));
  }else{
    queue.push(strID);
  }
}
function search_video(querry,callback){
  request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(querry) +"&key=" + yt_api_key, function(error,response,body)
  {
    var json =JSON.parse(body);
    callback(json.items[0].id.videoId);
  });
}

function isYoutube(str){
  return str.toLowerCase().indexOf("youtube.com") > -1;
}
