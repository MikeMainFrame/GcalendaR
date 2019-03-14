var GoogleAuth;

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: '........................',
    clientId: '....................apps.googleusercontent.com',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  }).then(function() {    
    GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.isSignedIn.listen(listUpcomingEvents);
    (GoogleAuth.isSignedIn.get()) 
    ? listUpcomingEvents() 
    : GoogleAuth.signIn();
  }, function(error) {
    console.log(JSON.stringify(error, null));
  });
}
function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMax': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  }).then(function(response) {
    var accumulated = 0;
    for (var ix = 0; ix < response.result.items.length; ix++) {      
      if (/#workhours/.test(response.result.items[ix].description)) {
        document.body.appendChild(calendarEntriesUI(response.result.items[ix]))
        var zero = new Date(response.result.items[ix].start.dateTime);
        var plus = new Date(response.result.items[ix].end.dateTime);
        accumulated = accumulated + ((plus - zero) / 6E4);
      }
    }
    document.getElementById("zSum").textContent ="workhours found and accumulated: " + accumulated;
  });
}
function calendarEntriesUI(gcSlots) {

  const oRadius = 500, iRadius = 400; var daysMinutes = "Ø";
  var zOffset = 0, zMinutes = 0, zh = 0, arcSweep = 0;
  var zero = new Date(gcSlots.start.dateTime);
  var duration = new Date(gcSlots.end.dateTime);  
  var tminus = (Date.now() - zero) / 60000;
  duration = duration - zero;
  zero.getHours() > 12 ? zh = zero.getHours() - 12 : zh = zero.getHours();
  zOffset = 450 - ((zh * 30) + (zero.getMinutes() / 2));
  zMinutes = duration / 60000 / 2;
  (zMinutes > 180) ? arcSweep = 1 : arcSweep = 0;
  (tminus < -1440) ? daysMinutes = parseInt(tminus / 1440) + " days" : daysMinutes = parseInt(tminus) + " minutes";

  var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  svg.setAttribute("width", "47%");
  svg.setAttribute("viewBox", "0 0 2400 1200");
  svg.setAttribute("style", "background: rgba(255,0,160,0.5) ; float:left; margin:1%");

  var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');

  g.appendChild(bCircle(500, "#212121"));
  g.appendChild(pathPeriod(zOffset, zOffset - zMinutes, iRadius, oRadius, arcSweep, "#F0A", 500));
  g.appendChild(bCircle(400, "#000"));

  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("id", "ztext");  
  path.setAttribute("fill", "none");
  path.setAttribute("d", "M 1000,500 A 500,500 0 0,1 0,500");
  g.appendChild(path);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("text-anchor", "start");
  text.setAttribute("font-size", 64);
  text.setAttribute("fill", "#fff");

  var textPath = document.createElementNS("http://www.w3.org/2000/svg", 'textPath');
  textPath.setAttribute("text-anchor", "start");
  textPath.setAttribute("href", "#ztext");
  textPath.textContent = daysMinutes;
  text.appendChild(textPath);

  g.appendChild(text);
  g.appendChild(addText(144, "#F0A", 500, 360, zMinutes * 2, 500));
  g.appendChild(addText(64, "#fff", 500, 492, gcSlots.start.dateTime, 100));

  g.setAttribute("transform", "translate(100,100)");
  svg.appendChild(g);

  var temp = addText(96, "#fff", 1150, 200, gcSlots.summary, 900);
  temp.setAttribute("text-anchor", "start");
  svg.appendChild(temp);
  
  var fObject = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
  fObject.setAttribute("x", 1200);
  fObject.setAttribute("y", 400);
  fObject.setAttribute("width", 800);
  fObject.setAttribute("height", 800);

  var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  div.textContent = gcSlots.description;
  div.setAttribute("style", "font-size:36pt")
  fObject.appendChild(div);
  svg.appendChild(fObject);

  return svg;

  function addText(fSize, color, x, y, title, fWeight) {
    var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute("text-anchor", "middle");
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
