# ezSFbmaster beta (Google Apps Script version)

**ezSFbmaster** is a web-application to fetch facebook post shared in a slack private channel, and create a feed of embeddable post on a HTML page; with a button to mark liked post back to the corresponing slack message. 

## Setup

1. Copy code.gs, oauth.gs, and template.html to your App Script project.

2. Visit to your App settings (https://api.slack.com/apps) on Slack API page, and register an app.

3. Go to "OAuth & Permissions".

4. Replace your Google-Apps-Script-ID to the following address, and then add it as a new Redirect URLs.
  ...
  https://script.google.com/macros/d/*< Google-Apps-Script-ID >*/usercallback
  ...

5. Add the following permission under Scropes,
  ...
  reactions:write,                  emoji:read,reactions:read,groups:history,groups:read,usergroups:read,incoming-webhook
  ...

6. Go to Basic Information, copy your *Client ID* and *Client Secret* to the fields in oauth.gs

7. To authorize this app, you can add a Slack button to your website. 
Visit the "Manage Distribution" setting, you can find the HTML code of Embeddable Slack Button for your App.

8. Use https://api.slack.com/methods/auth.test/test to obtain your team_id, and copy to the field named TEAMID in code.gs.

9. Use https://api.slack.com/methods/groups.list/test to find the id of your target private channel, and copy to the field named CHANNEL_ID in code.gs


## Demo

Demo of beta version 0.9 on [Google Apps Script](https://script.google.com/home/projects/1eyqB0XTVxvjKqDZjpiY0snWZO6ZvOsDaLyMxM7nh1X-gbRHzqzLn38iu)

## (c)2018 Chris K. Fung
