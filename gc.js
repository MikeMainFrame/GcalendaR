function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: '',
    clientId: '',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  }).then(function() {
    listUpcomingEvents()
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2), 'lColumn');
  });
}
function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  }).then(function(response) {
    calendarEntriesUI(response);
  });
}
function calendarEntriesUI(calendarJSON) {
  var gcSlots = JSON.parse(calendarJSON);
  const oRadius = 500, iRadius = 400;
  var zOffset = 0, zMinutes = 0, zh = 0, arcSweep = 0;
  var t0 = new Date(gcSlots.items[0].start.dateTime);
  const duration = (new Date(gcSlots.items[0].end.dateTime) - t0;
  const tMinus = Date.now() - t0;
  var days = parseInt(tMinus / (60 * 60 * 24));
  var minutes = parseInt((tMinus - (days * 60 * 60 * 24)) / 60);
  const counting =  "T - " + days + " days " + minutes + " minutes";  
  t0.getHours() > 12 ? zh = t0.getHours() - 12 : zh = t0.getHours();
  zOffset = 450 - ((zh * 30) + (t0.getMinutes() / 2));
  zMinutes = duration / 60000 / 2;
  (zMinutes > 180) ? arcSweep = 1 : arcSweep = 0;
  svg.appendChild(bCircle(500, "#212121"));
  svg.appendChild(pathPeriod(zOffset, zOffset - zMinutes, iRadius, oRadius, arcSweep, "#A00", 500));
  svg.appendChild(bCircle(400, "#000"));
  svg.appendChild(addText(244, "A00", 500, 360, parseInt(t0 / 60000), 500));
  svg.appendChild(addText(80, "#888", 500, 492, t0, 500));
  
  setInterval(moveHands, 5000);   
  
  return svg;
  
  function moveHands() {
   var now = Date.now();
   var diffSec = (t0 - now) / 1000;
   var days = parseInt(diffSec / (60 * 60 * 24));
   var minutes = parseInt((diffSec - (days * 60 * 60 * 24)) / 60);
   document.getElementById("tMinus").textContent =  days + ":" + minutes;
  }
  
  function addText(fSize, color, x, y, title, fWeight) {
    var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute("font-size", fSize);
    text.setAttribute("font-weight", fWeight);
    text.setAttribute("fill", color);
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.textContent = title;
    return text;
  }
  function pathPeriod(t0, t1, iRadius, oRadius, arcSweep, fill) {
    var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute("fill", fill);
    path.setAttribute("stroke-width", 0);
    path.setAttribute("d",
      "M " + parseFloat(500 + (Math.cos(t1 * Math.PI / 180) * iRadius)) +
      ", " + parseFloat(500 - (Math.sin(t1 * Math.PI / 180) * iRadius)) +
      "L " + parseFloat(500 + (Math.cos(t1 * Math.PI / 180) * oRadius)) +
      ", " + parseFloat(500 - (Math.sin(t1 * Math.PI / 180) * oRadius)) +
      "A " + oRadius + "," + oRadius + " 0 " + arcSweep + " ,0 " +
      parseFloat(500 + (Math.cos(t0 * Math.PI / 180) * oRadius)) +
      "," + parseFloat(500 - (Math.sin(t0 * Math.PI / 180) * oRadius)) +
      "L " + parseFloat(500 + (Math.cos(t0 * Math.PI / 180) * iRadius)) +
      ", " + parseFloat(500 - (Math.sin(t0 * Math.PI / 180) * iRadius)) +
      "A " + iRadius + "," + iRadius + " 1 " + arcSweep + " ,1 " +
      parseFloat(500 + (Math.cos(t1 * Math.PI / 180) * iRadius)) +
      "," + parseFloat(500 - (Math.sin(t1 * Math.PI / 180) * iRadius)) +
      " Z");
    return path;
  }
  function bCircle(radius, fill) {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); // overlay
    circle.setAttribute("cx", 500);
    circle.setAttribute("cy", 500);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", fill);
    return circle;
  }
}
