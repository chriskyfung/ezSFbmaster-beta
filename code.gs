/**
 * Authorizes and makes a request to the Meetup API.
 */
var FETCH_LIMIT = 20; // default fetch limit = 20
var TEAMWORK = '';
var CHANNEL_ID = '';
 
function doGet(e) {
  Logger.log('input arguements = ' + e);
  if (e.parameter.read_limit) {
    Logger.log('input read_limit =' + e.parameter.read_limit);
    FETCH_LIMIT = e.parameter.read_limit; // update fetch limit if the arg exists
  }
  var stream = run(); // execute main proceduces
  var html = HtmlService.createHtmlOutputFromFile('template.html');
      html.append('<div id="output">' + stream + '</div>');      
  return html;
} 

function doReload(e) {
    Logger.log('doReload: { ' + e + ' }');
    var limit = parseInt(e.read_limit);
    FETCH_LIMIT = limit; // update fetch limit
    Logger.log('Updated FETCH_LIMIT to ' + FETCH_LIMIT);
    var newOutput = run();
    return newOutput;
}

/* Main proceduces
    1. get Slack Service
    2a. Fetch Slack if slack service is accessiable
    2b. Render login buttons
*/
function run() {
  var service = getSlackService();
  if (service.hasAccess()) {
    var url = 'https://slack.com/api/auth.test';    
    var responses = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + service.getAccessToken()},
      'method' : 'post'
    });
    var authJson = JSON.parse(responses.getContentText());   
    Logger.log(JSON.stringify(authJson, null, 2));
    if (isValidMember(authJson['team_id'])) {
      var stream = getslackchannel(authJson['user_id']); // fetch 
      return stream;
    }
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    var html = HtmlService.createHtmlOutput('<b>Hello, world!</b>');
    html.append('<a href="' + authorizationUrl + '"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>');
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
    return html;
  }
}

// logout proceduces
function doReset() {
  var service = getSlackService();
  if (service.hasAccess()) {
      service.resetAuth();
  }
  return HtmlService.createHtmlOutputFromFile('logout_template');
}

function isValidMember(teamId){
  var service = getSlackService();
  if ( teamId == TEAMID) {
     return true;
  }
  service.resetAuth(); // not a 達人圈子 member
  return false;
}

function getslackchannel(userId) {
  var service = getSlackService();
    
  var stream = '';
  var DEFAULT_CHANNEL_NAME = '品牌修煉';    
  var params = { 'channel' :　CHANNEL_ID , 'count': FETCH_LIMIT };
  var url = 'https://slack.com/api/groups.history';
  var response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + service.getAccessToken()},
    'payload': params}
  );
  
  
    var result = JSON.parse(response.getContentText());   
    if (!result['ok']) {
      $("#warning").html("Error(110): Slack上的「" + DEFAULT_CHANNEL_NAME + "」Channel 讀取失敗!");
    } else {
      var listing = result["messages"].reverse();
      for (var i in listing) {        
        var key = listing[i];
        if (key.hasOwnProperty('attachments')){     
          var obj = key.attachments;
          var url = obj[0].original_url;
          
          // check if the post has aleary marked on Slack
          var isliked = false;
          if (key.hasOwnProperty('reactions')){                   
            for (var r in key.reactions) {
              var likedusers = key.reactions[r].users;                           
              for (var l in likedusers) {
                var uid = likedusers[l];
                if (uid == userId) { isliked = true; break;}                                
              };
              if (isliked) { break; }
            };
          };
          stream += embedFB_ui(i, url, key.ts, isliked);
      }};
    }  
  return stream;
};


function embedFB_ui(i, url, ts, isliked) {  
  var htmltxt = [];
  
  const regex_fbid = /fbid=([0-9]+)/;
  const regex_id = /\Wid=([0-9]+)/;
  var res_fbid = regex_fbid.exec(url);
  var res_id = regex_id.exec(url);
  if (res_fbid && res_id) {
    var old_url = url;
    url = 'https://www.facebook.com/' + res_id[1] + '/posts/' + res_fbid[1];
  }

  url = url.replace('m.facebook.com', 'www.facebook.com');
  
  var encodedUrl = encodeURIComponent(url);
  
  if (isliked) { htmltxt += '<div class="fb-post liked-post">'; }
  else { htmltxt += '<div class="fb-post">'; }
  
  // Embed each facebook post
  htmltxt += '<iframe class="fb-iframe" id="fb-iframe_' + i + '" src="https://www.facebook.com/plugins/post.php?href='+ encodedUrl + '&width=500&appId=1146717015478341" width="500" height="500" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>';
  
  htmltxt += '<button class="enlarge" value="fb-iframe_' + i + '" type="submit">+</button>';
  
  // Display URL as caption
  htmltxt += '<br><a href="' + url + '" target="_blank">' + url + '</a><br>';
  // Display a correspending button
  htmltxt += '<button class="marks" id="markbtn' + i + '" type="submit" value="' + ts + '">Mark on Slack</button>';
  if (isliked){ htmltxt += ' <i class="fa fa-check-circle" style="color:green"></i>'; }
  htmltxt += '</div>';
  return htmltxt;
};

// OnClickEvent - Mark Liked on Slack
function onClickBtn(ts) {

      var service = getSlackService();
      var url = 'https://slack.com/api/reactions.add';
      var params2 = { 'name' : 'thumbsup', 'channel' :　'G8CF3QA05' , 'timestamp': ts };
         
      var response = UrlFetchApp.fetch(url, {
         headers: { 'Authorization': 'Bearer ' + service.getAccessToken()},
         'method' : 'post', 'payload': JSON.stringify(params2), 'contentType': 'application/json' }
      );
      
      var result = JSON.parse(response.getContentText());
      //Logger.log(result);
      if (result['ok'] || result['error']=='already_reacted') { return true;
      } else {       
        return false; 
      }

};