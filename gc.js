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
    document.getElementById('lColumn').addEventListener("click", getEvents);
   }, function(error) {
    appendPre(JSON.stringify(error, null, 2), 'lColumn');
  });
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
 function showTasks(group, no) {

    var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("fill", "#FFF");
    g.setAttribute("font-size", 56);      
    g.setAttribute("font-weight", 300);
    g.setAttribute("text-anchor", "end");

    var rect =  document.createElementNS("http://www.w3.org/2000/svg", 'rect'); 
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("rx", 30);      
    rect.setAttribute("ry", 30);
    rect.setAttribute("width", 600);
    rect.setAttribute("height", 300); 
    rect.setAttribute("fill", group.color); 
    rect.setAttribute("id", group.id); 
    rect.addEventListener("click", function (e) {
      document.getElementById("wwTaskSpec").appendChild(showTaskDetails(parseInt(e.target.id, 10) ) ) 
    }, false);     

    g.appendChild(rect);

    var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');    
    text.setAttribute("x",  30);     
    text.setAttribute("y",  270);                                              
    text.setAttribute("text-anchor", "end");                                                   
    text.setAttribute("font-weight",  900);
    text.textContent = "#" + group.id;
    text.setAttribute("transform", "rotate(90 30 270)");
    g.appendChild(text);

    var three = group.address.split(","); 

    g.appendChild(addText("Roboto", 62, "#FFF", 590, 86, three[0], 600));   
    g.appendChild(addText("Roboto", 56, "#FFF", 590, 160, three[1], 300));   
    g.appendChild(addText("Roboto", 56, "#FFF", 590, 214, three[2], 300));   

    g.setAttribute("transform", "translate(30," + (no * 330) + ")");      

    return g;
  }	
  function showTaskDetails(taskid) { 

    const oRadius = 500, iRadius = 400; 
    var zOffset = 0, zSum = 0, zMinutes = 0, jx=0, ix=0, zh=0, arcSweep = 0, coleur = "";

    var execute = document.getElementById("toDie");    
    if (execute) execute.parentNode.removeChild(execute); 

    var m = document.createElementNS("http://www.w3.org/2000/svg", 'g');  
    m.setAttribute("text-anchor", "middle")      
    m.setAttribute("font-weight", 600);
    m.setAttribute("id", "toDie");

    for (ix = 0 ; ix < zGeoList.length; ix++) {         
      if (zGeoList[ix].address === zGeoList[taskid].address) { 
        if (zGeoList[ix].id === 9999) {
          var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');

          zSum = zSum + zGeoList[ix].duration; 
          var zTimestamp = new Date (parseFloat(zGeoList[ix].timestamp));
          zTimestamp.getHours() > 12 ? zh = zTimestamp.getHours() - 12 : zh = zTimestamp.getHours();
          zOffset = 450 - ((zh * 30) + (zTimestamp.getMinutes() / 2));
          zMinutes = zGeoList[ix].duration / 60000 / 2; 
          (zMinutes > 180) ? arcSweep = 1 : arcSweep = 0; 
          g.appendChild(bCircle(500, "#212121"));   
          g.appendChild(pathPeriod(zOffset,zOffset - zMinutes,iRadius,oRadius,arcSweep,coleur,500));             
          g.appendChild(bCircle(400, "#000"));   
          g.appendChild(addText("Racing Sans One", 244, coleur, 500, 360, parseInt(zGeoList[ix].duration / 60000), 500));
          g.appendChild(addText("Roboto", 80, "#888", 500, 492, timeStamp(zTimestamp),500));   
          g.setAttribute("transform", "translate(" + ((jx % 2) * 500) + ", " + parseInt((jx * 900) + 150, 10) + ")");
          jx++;
          m.appendChild(g);          
        } else {
          coleur = zGeoList[ix].color;
        }    
      }        
    }

    m.appendChild(addText("Racing Sans One", 80 , "#888", 80, 80, parseInt(zSum / 60000, 10)));

    return m;   
}                             
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
