function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: '',
    clientId: '',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest","https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly',
  }).then(function () {
    //gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    document.getElementById('lColumn').addEventListener("click", getEvents);
    document.getElementById('rColumn').addEventListener("click", getMails);
   }, function(error) {
    appendPre(JSON.stringify(error, null, 2), 'lColumn');
  });
}
function getMails() {
 if (gapi.auth2.getAuthInstance().isSignedIn.get()) listMails(true);
}
function getEvents () {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) listUpcomingEvents(true);
}
function appendPre(message, column) {
  var pre = document.getElementById(column);
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}
function listUpcomingEvents() {
  document.getElementById('lColumn').style.backgroundColor = "rgba(0,0,255,0.5)";
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  }).then(function(response) {
    appendPre(JSON.stringify(response, null, 2), 'lColumn');
  });
}
