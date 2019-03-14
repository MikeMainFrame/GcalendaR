var GoogleAuth;

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: '..................',
    clientId: '........................apps.googleusercontent.com',
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
    'maxResults': 50,
    'orderBy': 'startTime'
  }).then(function(response) {
    var slices = [];
    for (var ix = 0; ix < response.result.items.length; ix++) {      
      if (/#workhours/.test(response.result.items[ix].description)) {
        var zero = new Date(response.result.items[ix].start.dateTime);
        var plus = new Date(response.result.items[ix].end.dateTime);       
        var pair = {};
        pair.duration = plus - zero;
        pair.timestamp = zero;
        slices.push(pair);
      }
    }
    document.getElementById("zCircularTime").appendChild(ringOfTime(slices));
  });
}
function ringOfTime(slices) {

  const oRadius = 500, iRadius = 400, thisColor = "#F0A"; 
  var zOffset = 0, zMinutes = 0, max = new Date().getTime(), min = max - (1000*60*60*24*40);  
  var zBand = max - min, zUnits = zBand / 360, zSum = 0;
      
  var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');  
  g.setAttribute("text-anchor", "middle");
  g.setAttribute("font-family", "sans-serif");
  g.setAttribute("font-size", 18);      
  g.setAttribute("fill", "white");
  g.setAttribute("transform", "translate(100,100)");
  

  for (var ix = 0; ix < slices.length; ix++) {      
    if (slices[ix].timestamp < min) continue;
    zMinutes = slices[ix].duration / zUnits;
    zOffset = (slices[ix].timestamp - min) / zUnits;
    zSum = zSum + parseInt(slices[ix].duration);
    var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');    
    path.setAttribute("id", ix);     
    path.setAttribute("ztimestamp", slices[ix].timestamp); 
    path.setAttribute("zduration", slices[ix].duration); 
    path.setAttribute("fill", thisColor);      
    path.setAttribute("stroke-width", 0);  
    path.setAttribute("d",
        "M " + parseFloat(500 + (Math.cos(zOffset * Math.PI/180) * iRadius)) + ", " 
             + parseFloat(500 - (Math.sin(zOffset * Math.PI/180) * iRadius))
      + "L " + parseFloat(500 + (Math.cos(zOffset * Math.PI/180) * oRadius)) + ", " 
             + parseFloat(500 - (Math.sin(zOffset * Math.PI/180) * oRadius))
      + "A " + oRadius + "," + oRadius + " 0 0,1 " 
             + parseFloat(500 + (Math.cos((zMinutes + zOffset) * Math.PI/180) * oRadius)) +  "," 
             + parseFloat(500 - (Math.sin((zMinutes + zOffset) * Math.PI/180) * oRadius))
      + "L " + parseFloat(500 + (Math.cos((zMinutes + zOffset) * Math.PI/180) * iRadius)) + ", " 
             + parseFloat(500 - (Math.sin((zMinutes + zOffset) * Math.PI/180) * iRadius))
      + "A " + iRadius + "," + iRadius + " 1 0,0 " 
             + parseFloat(500 + (Math.cos((zMinutes + zOffset) * Math.PI/180) * iRadius)) +  "," 
             + parseFloat(500 - (Math.sin((zMinutes + zOffset) * Math.PI/180) * iRadius))
      + " Z");        
    path.addEventListener("click", showInfo);
    g.appendChild(path);
    
    var today = new Date(parseFloat(slices[ix].timestamp)); 
    var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');    
    X = parseFloat(oRadius + (Math.cos(zOffset * Math.PI/180) * oRadius));
    Y = parseFloat(oRadius - (Math.sin(zOffset * Math.PI/180) * oRadius));           
    text.setAttribute("x",  X);     
    text.setAttribute("y",  Y);           
    text.textContent = parseInt(slices[ix].duration / 60000);
    g.appendChild(text);
  }      
  
  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');       
  text.setAttribute("font-size",  48);     
  text.setAttribute("x",  500);     
  text.setAttribute("y",  500);           
  text.textContent = parseInt(zSum / 60000);
  g.appendChild(text);
  
  for (var ix = 0; ix < 360; ix = ix + 9) {    
    var thatDay = new Date(parseFloat(max - (ix / 9 * (1000*60*60*24))));
    X = parseFloat(oRadius + (Math.cos(ix * Math.PI/180) * (iRadius - 10)));
    Y = parseFloat(oRadius - (Math.sin(ix * Math.PI/180) * (iRadius - 10)));     
    if (thatDay.getDate() === 1) {
      var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');    
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size",  14);     
      text.setAttribute("fill", "#FFF");      
      text.setAttribute("x",  X);     
      text.setAttribute("y",  Y);                     
      text.setAttribute("transform", "rotate(" + (360 - ix) + " " + X + " " + Y + ")");
      var temp = thatDay.toUTCString().split(" ");
      text.textContent = temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[3];
      g.appendChild(text)
    } else {
      var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');        
      circle.setAttribute("r", 2);    
      circle.setAttribute("fill", "#fff");  
      circle.setAttribute("cx", X);  
      circle.setAttribute("cy", Y);  
      g.appendChild(circle);
    }  
  }     
  return(g);    
}
function showInfo(what) {
  var temp = new Date(parseFloat(what.target.getAttribute("ztimestamp")));    
  alert(temp.getUTCDate());    
}
