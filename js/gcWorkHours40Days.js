var GoogleAuth, dispatchData = {}; zSumma = 0;

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: 'AIzaSyBUnSQok1aZX75FfNHRosmxN2c2WNJY7tw',
    clientId: '545632756570-6rnj9b07bo29k8cu8002aue2t96ttci5.apps.googleusercontent.com',
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
    'timeMin': (new Date(new Date()-40*24*60*60*1000)).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 99,
    'orderBy': 'startTime'
  }).then(function(response) {
    var slices = [], h = document.getElementById("h"), c1 = document.getElementById("c1"), c2 = document.getElementById("c2");
    for (var ix = 0; ix < response.result.items.length; ix++) {      
      if (/#workhours/.test(response.result.items[ix].description)) {       
        var pair = {};
        pair.timestamp = new Date(response.result.items[ix].start.dateTime);
        pair.duration = new Date(response.result.items[ix].end.dateTime) - pair.timestamp;
        pair.task = response.result.items[ix].summary;
        slices.push(pair);
        c1.appendChild(calendarEntriesDisplay(response.result.items[ix]));
        zSumma += pair.duration;
      }
    }
    dispatchData.displayName = response.result.items[0].organizer.displayName;
    dispatchData.email = response.result.items[0].organizer.email;
    dispatchData.timeSlots = slices;

    h.appendChild(headInfo(dispatchData));
    c2.appendChild(ringOfTime(slices));
  });
}
function ringOfTime(slices) {

  const oRadius = 500, iRadius = 400, thisColor = "#F0A"; 
  var zOffset = 0, zMinutes = 0, max = new Date().getTime(), min = max - (1000*60*60*24*40);  
  var zBand = max - min, zUnits = zBand / 360, zSum = 0, r = 2;
      
  var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  svg.setAttribute("viewBox", "0 0 1200 1200");


  var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');  
  g.setAttribute("text-anchor", "middle");
  g.setAttribute("font-family", "sans-serif");
  g.setAttribute("font-size", 22);      
  g.setAttribute("fill", "white");
  g.setAttribute("transform", "translate(100,100)");  

  g.appendChild(addCircle(oRadius,"rgba(0,0,255,0.3)"));
  var image = document.createElementNS("http://www.w3.org/2000/svg", 'image');  
  image.setAttribute("href", "https://storage.googleapis.com/milliniumfalcon/falconRotate.svg");
  image.setAttribute("height", oRadius);
  image.setAttribute("width", oRadius);
  image.setAttribute("x", 250);
  image.setAttribute("y", 250);
  g.appendChild(image);

  var sendData = addCircle(iRadius,"rgba(0,0,255,0.3)");
  sendData.setAttribute("id", "zxmit");
  g.appendChild(sendData);

  for (var ix = 0; ix < slices.length; ix++) {      
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
    g.appendChild(path);
        
    var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');    
    X = parseFloat(oRadius + (Math.cos(zOffset * Math.PI/180) * oRadius));
    Y = parseFloat(oRadius - (Math.sin(zOffset * Math.PI/180) * oRadius));           
    text.setAttribute("x",  X);     
    text.setAttribute("y",  Y);           
    text.textContent = parseInt(slices[ix].duration / 60000);

  }      
  g.appendChild(addText(48,"#fff",500,250, parseInt(zSum / 60000) + " minutes"));
  
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
      (thatDay.getUTCDay() === 0) ? r = 4 : r = 2;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');        
      circle.setAttribute("r", r);    
      circle.setAttribute("fill", "#fff");  
      circle.setAttribute("cx", X);  
      circle.setAttribute("cy", Y);  
      g.appendChild(circle);
    }  
  }    

  svg.appendChild(g);

  var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("id", "zCircleT");  
  path.setAttribute("fill", "none");
  path.setAttribute("d", "M 0,500 A 500,500 0 1,1 1000,500");
  g.appendChild(path);  
  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("text-anchor", "start");
  text.setAttribute("font-size", 36);
  text.setAttribute("letter-spacing", 9);
  text.setAttribute("fill", "#fff");
  var textPath = document.createElementNS("http://www.w3.org/2000/svg", 'textPath');
  textPath.setAttribute("text-anchor", "start");
  textPath.setAttribute("href", "#zCircleT");
  textPath.textContent = dateMonthYear(new Date(min)) + " - " + dateMonthYear(new Date());
  text.appendChild(textPath);
  g.appendChild(text);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("text-anchor", "end");
  text.setAttribute("x",  500);     
  text.setAttribute("y",  800);  
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", 36);
  text.textContent = "click to rapport";  
  g.appendChild(text);

  sendData.addEventListener("click", wrapUp);

  svg.appendChild(g);
// 
  return(svg);
}
/**
* we get a start/end slot, some text
*/
function calendarEntriesDisplay(gcSlots) {

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
  svg.setAttribute("viewBox", "0 0 2400 1200");
  svg.setAttribute("style", "background: rgba(255,0,160,0.3) ; float:left; clear:both");

  var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');  
  g.setAttribute("transform", "translate(100,100)");

  g.appendChild(addCircle(500, "rgba(255,0,160,0.3)"));
  g.appendChild(addPathPeriod(zOffset, zOffset - zMinutes, iRadius, oRadius, arcSweep, "rgba(255,255,255,0.5)", 500));
  g.appendChild(addCircle(400, "rgba(255,0,160,0.3)"));

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
  textPath.textContent = weekDay(new Date(gcSlots.start.dateTime));
  text.appendChild(textPath);

  g.appendChild(text);

  g.appendChild(addText(144, "#fff", 500, 360, zMinutes * 2, 500));
  g.appendChild(addText(64, "#fff", 500, 492, gcSlots.start.dateTime, 100));
  
  svg.appendChild(g);

  svg.appendChild(addText(96, "#fff", 1150, 200, gcSlots.summary, 700, "start"));
  
  var fObject = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
  fObject.setAttribute("x", 1200);
  fObject.setAttribute("y", 400);
  fObject.setAttribute("width", 800);
  fObject.setAttribute("height", 800);

  var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  div.textContent = gcSlots.description;
  div.setAttribute("style", "font-size:48pt")
  fObject.appendChild(div);
  svg.appendChild(fObject);

  return svg;
}
/**
* text element 
*/
function addText(fSize, color, x, y, title, fWeight, sme = "middle") {
  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("text-anchor", sme);
  text.setAttribute("font-size", fSize);
  text.setAttribute("font-weight", fWeight);
  text.setAttribute("fill", color);
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.textContent = title;

  return text;
}
/**
* makes an arc 
*/
function addPathPeriod(t0, t1, iRadius, oRadius, arcSweep, fill) {
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
function addCircle(radius, fill, x = 500, y = 500) {
  var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); // overlay
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", fill);
  return circle;
}
function dateMonthYear(jDate) {
  return jDate.getUTCDate() + "JANFEBMARAPRMAJJUNJULAUGSEPOCTNOVDEC".substr((jDate.getUTCMonth() * 3), 3) + jDate.getUTCFullYear()
}
function weekDay(jDate) {
  return "MONDAY   -TUESDAY  -WEDNESDAY-THURSDAY -FRIDAY   -SATURDAY -SUNDAY   ".substr((jDate.getUTCDay() * 10), 9);
}
function wrapUp() {
 time
  var xmlhttp = new XMLHttpRequest();    
  // 
  xmlhttp.onreadystatechange = () => { 
    if (xmlhttp.readyState === 4 ) document.getElementById("c1").innerHTML = "<h1>Data dispatched</h1>";
  };
  xmlhttp.open("POST","gcTimeSlotsPut.php",true);  
  xmlhttp.send(JSON.stringify(dispatchData));
}

function headInfo (times) {

  var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
  g.setAttribute("stroke", '#888');

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("x", 30);
  text.setAttribute("y", 30);
  text.setAttribute("stroke", "none");
  text.setAttribute("fill", "#fff");
  text.setAttribute("font-size", 48);
  text.setAttribute("font-weight", 900);
  text.setAttribute("transform", "rotate(90 30 30)");
  text.textContent =  "#1"
  g.appendChild(text);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("x", 96);
  text.setAttribute("y", 40);
  text.setAttribute("font-size", 24);
  text.setAttribute("font-weight", 100);
  text.setAttribute("fill", "#888");
  text.textContent =  times.email;
  g.appendChild(text);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("x", 96);
  text.setAttribute("y", 84);
  text.setAttribute("font-size", 48);
  text.setAttribute("font-weight", 600);
  text.setAttribute("fill", "#fff");
  text.textContent =  times.displayName || "Self";
  g.appendChild(text);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("x", 660);
  text.setAttribute("y", 40);
  text.setAttribute("font-size", 36);  
  text.setAttribute("font-weight", 100);
  text.setAttribute("fill", "#888");
  text.textContent = (times.timeSlots[0].timestamp).toISOString();
  g.appendChild(text);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("x", 660);
  text.setAttribute("y", 84);
  text.setAttribute("fill", "#888");  
  text.setAttribute("font-weight", 100);
  text.setAttribute("font-size", 36);
  text.textContent = (times.timeSlots[times.timeSlots.length-1].timestamp).toISOString();
  g.appendChild(text);

  var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute("x", 1224);
  text.setAttribute("y", 84);
  text.setAttribute("fill", '#fff');
  text.setAttribute("font-size", 48);
  text.setAttribute("font-weight", 100);
  text.textContent = "workHours: ";
  g.appendChild(text);

  var tspan = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
  tspan.setAttribute("font-weight", '900');
  tspan.textContent = milliSecToHourMinutes(zSumma);
  text.appendChild(tspan);
  g.appendChild(text);

  return g;

  function milliSecToHourMinutes (duration) {
    var hours = parseInt(duration / 36E5);
    var temp = duration - (hours * 36E5);
    if (temp > 2280000) return hours + '\u00BE';
    if (temp > 1680000) return hours + '\u00BD';
    if (temp >  480000) return hours + '\u00BC';
    return hours;
  }
}
