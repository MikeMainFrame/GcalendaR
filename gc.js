function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function initClient() {
  gapi.client.init({
    apiKey: '',
    clientId: '',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  }).then(function () {
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
  function calendarEntriesUI (calendarJSON) { 
    var gcSlots = JSON.parse(calendarJSON);

    const oRadius = 500, iRadius = 400; 
    var zOffset = 0, zMinutes = 0, jx=0, ix=0, zh=0, arcSweep = 0;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.setAttribute("width", "100%");
    svg.setAttribute("viewBox", "0 0 1200 1200");
    svg.setAttribute("color", "#fff");
    svg.setAttribute("background", "#000");
    var zTimestamp = new Date (parseFloat(zGeoList[ix].timestamp));
    zTimestamp.getHours() > 12 ? zh = zTimestamp.getHours() - 12 : zh = zTimestamp.getHours();
    zOffset = 450 - ((zh * 30) + (zTimestamp.getMinutes() / 2));
    zMinutes = zGeoList[ix].duration / 60000 / 2; 
    (zMinutes > 180) ? arcSweep = 1 : arcSweep = 0; 
    svg.appendChild(bCircle(500, "#212121"));   
    svg.appendChild(pathPeriod(zOffset,zOffset - zMinutes,iRadius,oRadius,arcSweep,coleur,500));             
    svg.appendChild(bCircle(400, "#000"));   
    svg.appendChild(addText("Racing Sans One", 244, coleur, 500, 360, parseInt(zGeoList[ix].duration / 60000), 500));
    svg.appendChild(addText("Roboto", 80, "#888", 500, 492, timeStamp(zTimestamp),500));   
    
    return svg;

    function addText (fType, fSize, color, x, y, title, fWeight) {      
      var text = document.createElementNS("http://www.w3.org/2000/svg", 'text'); 
      text.setAttribute("font-family",  fType);
      text.setAttribute("font-size",  fSize);  
      text.setAttribute("font-weight",  fWeight);      
      text.setAttribute("fill", color);      
      text.setAttribute("x",  x);     
      text.setAttribute("y",  y);           
      text.textContent = title;
      return text;
    }
    function pathPeriod (t0, t1, iRadius, oRadius, arcSweep, fill) {
      var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.setAttribute("fill", fill);      
      path.setAttribute("stroke-width", 0);  
      path.setAttribute("d",
        "M " + parseFloat(500 + (Math.cos(t1 * Math.PI/180) * iRadius)) 
      + ", " + parseFloat(500 - (Math.sin(t1 * Math.PI/180) * iRadius))
      + "L " + parseFloat(500 + (Math.cos(t1 * Math.PI/180) * oRadius)) 
      + ", " + parseFloat(500 - (Math.sin(t1 * Math.PI/180) * oRadius))
      + "A " + oRadius + "," + oRadius + " 0 " + arcSweep + " ,0 " 
             + parseFloat(500 + (Math.cos(t0 * Math.PI/180) * oRadius)) 
      +  "," + parseFloat(500 - (Math.sin(t0 * Math.PI/180) * oRadius))
      + "L " + parseFloat(500 + (Math.cos(t0 * Math.PI/180) * iRadius)) 
      + ", " + parseFloat(500 - (Math.sin(t0 * Math.PI/180) * iRadius))
      + "A " + iRadius + "," + iRadius + " 1 " + arcSweep + " ,1 " 
             + parseFloat(500 + (Math.cos(t1 * Math.PI/180) * iRadius)) 
      +  "," + parseFloat(500 - (Math.sin(t1 * Math.PI/180) * iRadius))
      + " Z");              
      return path;
    }
    function bCircle (radius, fill) {
      var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');  // overlay
      circle.setAttribute("cx", 500);
      circle.setAttribute("cy", 500);
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", fill);
      return circle;
    }  
}     
