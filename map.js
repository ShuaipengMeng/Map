var map, infobox, tooltip,watchId, userPin, directionsManager, routePath,trafficManager,searchManager;
var tooltipTemplate = '<div style="background-color:white;height:20px;width:120px;padding:5px;text-align:center"><b>{title}</b></div>';
var maps, directionsManagers = [];
var id_park='NA';
var distance=100;
    function GetMap() {
        map = new Microsoft.Maps.Map('#myMap', {
            center: new Microsoft.Maps.Location(-37.8136,144.9631),
            zoom: 15
        });
//////////////////
        //Create an infobox to use as a tooltip when hovering.
        tooltip = new Microsoft.Maps.Infobox(map.getCenter(), {
            visible: false,
            showPointer: false,
            showCloseButton: false,
            offset: new Microsoft.Maps.Point(-5, 5)
        });

        tooltip.setMap(map);

        //Create an infobox for displaying detailed information.
        infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
            visible: false
        });

        infobox.setMap(map);
///////////////
        //Load the directions and spatial math modules.
        Microsoft.Maps.loadModule(['Microsoft.Maps.AutoSuggest','Microsoft.Maps.Directions','Microsoft.Maps.Traffic','Microsoft.Maps.Search'], function () {
            //matching address
            onLoad();

            // var options = {maxResults: 4,map: map};
            // var manager = new Microsoft.Maps.AutosuggestManager(options);
            // manager.attachAutosuggest('#origineTbx', '#origineTbxd', selectedSuggestion);
            // manager.attachAutosuggest('#detinationTbx', '#detinationTbxd', selectedSuggestion);

            //Create an instance of the directions manager.
            directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
            trafficManager = new Microsoft.Maps.Traffic.TrafficManager(map)
            trafficManager.showFlow();
            //Define direciton options that you want to use, that won't be reset the next time a route is calculated.

            //Set the request options that avoid highways and uses kilometers.
            directionsManager.setRequestOptions({
                distanceUnit: Microsoft.Maps.Directions.DistanceUnit.km,
                routeMode: Microsoft.Maps.Directions.RouteMode.driving,
                routeOptimization:Microsoft.Maps.Directions.RouteOptimization.timeWithTraffic,
                routeAvoidance: [Microsoft.Maps.Directions.RouteAvoidance.avoidLimitedAccessHighway]
            });

            //Make the route line thick and green.
            directionsManager.setRenderOptions({
                drivingPolylineOptions: {
                    strokeColor: 'blue',
                    strokeThickness: 6
                }
            });

            Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', directionsUpdated);
        });

        function onLoad(){
            var options = {maxResults: 4,map: map};
            initAutosuggestControl(options, "origineTbx", "origineTbxd");
            initAutosuggestControl(options, "detinationTbx", "detinationTbxd");
            // var manager = new Microsoft.Maps.AutosuggestManager(options);
            }

        function selectedSuggestion(suggestionResult) {
                    map.entities.clear();
                    map.setView({ bounds: suggestionResult.bestView });
                    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location);
                    map.entities.push(pushpin);
                    document.getElementById('printoutPanel').innerHTML =
                        'Suggestion: ' + suggestionResult.formattedSuggestion +
                            '<br> Lat: ' + suggestionResult.location.latitude +
                            '<br> Lon: ' + suggestionResult.location.longitude;
                }

    }


function initAutosuggestControl(
  options,
  suggestionBoxId,
  suggestionContainerId
) {
  var manager = new Microsoft.Maps.AutosuggestManager(options);
  manager.attachAutosuggest(
    "#" + suggestionBoxId,
    "#" + suggestionContainerId,
    selectedSuggestion
  );

  function selectedSuggestion(suggestionResult) {
    document.getElementById(suggestionBoxId).innerHTML =
      suggestionResult.formattedSuggestion;
  }
}


function getRoute(start, end, color) {
        // clearDirections();
        Microsoft.Maps.loadModule(['Microsoft.Maps.Directions','Microsoft.Maps.Traffic'], function () {})

        var dm = new Microsoft.Maps.Directions.DirectionsManager(map);
        trafficManager = new Microsoft.Maps.Traffic.TrafficManager(map)
            trafficManager.showFlow();
        directionsManagers.push(dm);
        // alert('hgjgj')
        // alert(marker.getLocation())
        dm.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.transit
        });

        dm.setRenderOptions({
            autoUpdateMapView: false,
            drivingPolylineOptions: {
                strokeColor: color,
                strokeThickness: 3
            }
        });

        dm.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: 'Car Park',location: start,visible:false}));
        dm.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: end }));
        dm.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel'),waypointPushpinOptions: {visible: true,text:"Destination"},firstWaypointPushpinOptions: {visible: true,text:""} });
        //dm.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') });
        dm.calculateDirections();

    }

    function startTracking() {
        //Add a pushpin to show the user's location.
        userPin = new Microsoft.Maps.Pushpin(map.getCenter(), { visible: false });
        map.entities.push(userPin);

        //Watch the users location.
        watchId = navigator.geolocation.watchPosition(usersLocationUpdated);
        //getRoute('990 la trob street Docklands', '818 Bourke Street, Docklands, Vic 3008', 'red')
    }

    function usersLocationUpdated(position) {
        var loc = new Microsoft.Maps.Location(
            position.coords.latitude,
            position.coords.longitude);
        // var end= document.getElementById('detinationTbx').value
        //Update the user pushpin.

        userPin.setLocation(loc);
        userPin.setOptions({ visible: true });

        //Center the map on the user's location.
        map.setView({ center: loc });
        //Calculate a new route if one hasn't been calculated or if the users current location is further than 50 meters from the current route.
        // if (!routePath || Microsoft.Maps.SpatialMath.getDistance(loc, routePath) > 50) {
            if (!routePath || distance > .50) {

            calculateRoute(loc, getPushpinById(id_park).metadata.lat_lon);
            // calculateRoute(loc, getPushpinById(pushpinClicked).metadata.lat_lon);

        }

        var st = getPushpinById(id_park).metadata.lat_lon
        var end= document.getElementById('detinationTbx').value
        color='red'
        // alert(getPushpinById('0').metadata.lat_lon)
        getRoute(st, end, color)
    }

    function stopTracking() {
        location.reload();
        // Cancel the geolocation updates.
        navigator.geolocation.clearWatch(watchId);

        //Remove the user pushpin.
        map.entities.clear();
        clearDirections();
        clearDirectionsdm();

        document.getElementById('info').style.display = "none";

        document.getElementById('myDynamicTable').style.display = "none";

        document.getElementById('test').style.display = "none";
        document.getElementById('routeInfoPanel').style.display = "none";
        document.getElementById('detinationTbx').value = "";
        document.getElementById('origineTbx').value = "";
        

    }

    function calculateRoute(userLocation, destination) {
        clearDirections();

        //Create waypoints to route between.
        directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: userLocation }));
        directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: destination }));
    
        //Calculate directions and information pannel.
        // directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel1') });
        directionsManager.calculateDirections();
        //directionsManager.Waypoints.Remove(new Microsoft.Maps.Directions.Waypoint({ location: destination }));
    }
    function showroute(){
        clearDirections();

        var start = new Microsoft.Maps.Directions.Waypoint({ address: document.getElementById('origineTbx').value });
        directionsManager.addWaypoint(start);
        var end = new Microsoft.Maps.Directions.Waypoint({ location: getPushpinById(id_park).metadata.lat_lon });
        directionsManager.addWaypoint(end);
        directionsManager.calculateDirections();
        var st = getPushpinById(id_park).metadata.lat_lon
        var end= document.getElementById('detinationTbx').value
        color='red'
        // alert(getPushpinById('0').metadata.lat_lon)
        getRoute(st, end, color)

    }

    function directionsUpdated(e) {
        //When the directions are updated, get a polyline for the route path to perform calculations against in the future.
        var route = directionsManager.getCurrentRoute();
        if (route && route.routePath && route.routePath.length > 0) {
            routePath = new Microsoft.Maps.Polyline(route.routePath);
        }
        var routeIdx = directionsManager.getRequestOptions().routeIndex;

            //Get the distance of the route, rounded to 2 decimal places.
            var distance = Math.round(e.routeSummary[routeIdx].distance * 100)/100;
            var time = Math.round(e.routeSummary[routeIdx].timeWithTraffic / 60)
            document.getElementById('info').innerHTML='<h3>Instructions from car park to your destination:</h3> ';
            document.getElementById('routeInfoPanel').innerHTML = 'Optimised drive distance(km): ' + distance + ' ' + '<br/>Optimised drive time: ' + time + ' minutes';
            document.getElementById('carinfo').innerHTML = '<h3>The car park infomation:</3>';
        }

    function clearDirections() {
        //Clear directions waypoints and display without clearing it's options.
        directionsManager.clearDisplay();
        var wp = directionsManager.getAllWaypoints();
        if (wp && wp.length > 0) {
            for (var i = wp.length - 1; i >= 0; i--) {
                this.directionsManager.removeWaypoint(wp[i]);
            }
        }
        routePath = null;
    }

function clearDirectionsdm() {
        //Clear directions waypoints and display without clearing it's options.
        for(var k=0;k<directionsManagers.length;k++){
        directionsManagers[k].clearDisplay();
        var wp = directionsManagers[k].getAllWaypoints();
        if (wp && wp.length > 0) {
            for (var i = wp.length - 1; i >= 0; i--) {
                this.directionsManagers[k].removeWaypoint(wp[i]);
            }
        }
        routePath = null;
    }}

///////draw available parks/////
    function Search() {

        var ed = document.getElementById('detinationTbx').value;
        if (!searchManager) {
            //Create an instance of the search manager and perform the search.
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
                searchManager = new Microsoft.Maps.Search.SearchManager(map);
                Search()

    var requestOptions = {
        bounds: map.getBounds(),
        where: ed,
        callback: function (answer, userData) {
            map.setView({ bounds: answer.results[0].bestView });
            // Drop a pin based on user address
            var pins=new Microsoft.Maps.Pushpin(answer.results[0].location,{color: 'black',text: 'D'})
            pins.metadata = {
                                id: '5',title: 'end',text:'B'
                            };
            map.entities.push(pins);
        }
    };
    searchManager.geocode(requestOptions);
            });
        }

        else {
            //Remove any previous results from the map.
            map.entities.clear();

            //Get the users query and geocode it.
            // var query = document.getElementById('detinationTbx').value;
            var query = document.getElementById('origineTbx').value;
            // document.getElementById('myDynamicTable').style.display = "none";

            geocodeQuery(query);

            // getRoute('990 la trob street Docklands', '818 Bourke Street, Docklands, Vic 3008', 'red')
        }

    }
/////////get table/////////
function addTable() {
  var myTableDiv = document.getElementById("myDynamicTable");

  var table = document.createElement('TABLE');
  table.border = '1';

  var tableBody = document.createElement('TBODY');
  table.appendChild(tableBody);

  for (var i = 0; i < 3; i++) {
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    for (var j = 0; j < 4; j++) {
      var td = document.createElement('TD');
      td.width = '75';
      td.appendChild(document.createTextNode("Cell " + i + "," + j));
      tr.appendChild(td);
    }
  }
  myTableDiv.appendChild(table);
}

//////////////////////////

function getPushpinById(id){
    var pin;
    for(var j=0;j<map.entities.getLength();j++){
        pin = map.entities.get(j);
        if(pin.metadata.id === id){
            return pin;
        }
    }
}


function Showpushpin(){
    var pins;
    for(var j=0;j<map.entities.getLength();j++){
        pin = map.entities.get(j);
        pin.setOptions({ visible: true });

        }
    }
function go(e){
    // alert('hi')
// var elem = document.getElementById("myDynamicTable");
// elem.parentNode.removeChild(elem);
p = getPushpinById('5');
        map.entities.remove(p)
        // Hide the tooltip
        closeTooltip();
        clearDirections();
        clearDirectionsdm();
        navigator.geolocation.clearWatch(watchId);

        Showpushpin();
        id_park='0'//e.target.metadata.id.toString();
        getPushpinById(id_park).setOptions({ visible: false });
        //id_park.setOptions({color: 'blue'});
        var from_=document.getElementById('origineTbx').value

        if (from_=='my location'){
            startTracking()
        }
        else{
            showroute(from_,getPushpinById(id_park).metadata.lat_lon)

        }
}
///////////////////////////////////////
function pushpinClicked(e) {
        p = getPushpinById('5');
        map.entities.remove(p)
        // Hide the tooltip
        closeTooltip();
        clearDirections();
        clearDirectionsdm();
        navigator.geolocation.clearWatch(watchId);
        Showpushpin();
        id_park=e.target.metadata.id.toString();
        getPushpinById(id_park).setOptions({ visible: false });
        //id_park.setOptions({color: 'blue'});
        var from_=document.getElementById('origineTbx').value

        if (from_=='my location'){
            startTracking()
        }
        else{
            showroute(from_,getPushpinById(id_park).metadata.lat_lon)

        }
    }

    function pushpinHovered(e) {
        //Hide the infobox
        infobox.setOptions({ visible: false });

        //Make sure the infobox has metadata to display.
        if (e.target.metadata) {
            //Set the infobox options with the metadata of the pushpin.
            tooltip.setOptions({
                location: e.target.getLocation(),
                htmlContent: tooltipTemplate.replace('{title}', e.target.metadata.title),
                // htmlContent: tooltipTemplate.replace('{title}', e.target.metadata.id.toString()),

                visible: true
            });
        }
    }

    function closeTooltip() {
        //Close the tooltip and clear its content.
        tooltip.setOptions({
            visible: false
        });
    }
/////////get table/////////
function addTable() {
  var myTableDiv = document.getElementById("myDynamicTable");
  var table = document.createElement('TABLE');
  table.border = '1';
  var tableBody = document.createElement('TBODY');
  table.appendChild(tableBody);
  for (var i = 0; i < 6; i++) {
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);
    for (var j = 0; j < 2; j++) {
      var td = document.createElement('TD');
      td.width = window.screen.weight;
      if(i==0 & j==0){
        td.appendChild(document.createTextNode("Option"));
      }
      else if(i==0 & j==1){
        td.appendChild(document.createTextNode("Parking info"));
      }
      // else if(i==0 & j==2){
      //   td.appendChild(document.createTextNode("Distance"));
      // }
      else{
      td.appendChild(document.createTextNode("Cell " + i + "," + j))};
      tr.appendChild(td);
    }
  }
  myTableDiv.appendChild(table);
}
/////////////////////////////////////////
    function geocodeQuery(query) {

document.getElementById('myDynamicTable').innerHTML = "";
        var searchRequest = {
            where: query,
            callback: function (r) {
                if (r && r.results && r.results.length > 0) {
                    // get the lat lon seperately
  var myTableDiv = document.getElementById("myDynamicTable");
  var table = document.createElement('TABLE');
  table.border = '1';
  var tableBody = document.createElement('TBODY');
  table.appendChild(tableBody);

    var tr = document.createElement('TR');
    tableBody.appendChild(tr);
    for (var jjj = 0; jjj < 2; jjj++) {
      var td = document.createElement('TD');
      td.width = '170';
      if(jjj==0){
        td.appendChild(document.createTextNode("Option"));
      }
      else if(jjj==1){
        td.appendChild(document.createTextNode("Parking info"));
      }
      // else if(jjj==2){
      //   td.appendChild(document.createTextNode("Non Drive-Distance"));
      // }
      tr.appendChild(td);
    }
    myTableDiv.appendChild(table);

                    crd=r.results[0].location.toString().split('(')
                    crd=crd[1].slice(0,-2)
                    crd = crd.replace(/\s/g, '')
                    const url = "https://dbapi.eastus.cloudapp.azure.com/parkme/?lat_lon="+crd;
                    fetch(url).then((resp) => resp.json())
                    .then(function(data) {
                        // var myTableDiv = document.getElementById("myDynamicTable");
                        // var table = document.createElement('TABLE')
                        // table.border = '1';
                        // var tableBody = document.createElement('TBODY');
                        // table.appendChild(tableBody);

                        // myTableDiv.appendChild(table);
                        for (var i = 0, len = data.lat.length; i < len; i++) {
                            var color_='red'
                            if (i==0){color_='green'}
                            let jj=i+1
                        var ij=i+1
                            var pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parseFloat(data.lat[i]),parseFloat(data.lon[i])),{color: color_,text: jj.toString()});
                            // put top 5 closest slots
                            pin.metadata = {
                                id: i.toString(),
                                title: 'Parking slot: '+ij,
                                description:'approximate distance(m): '+Math.round(data.distance[i]*1000) + ' info: '+data.description1[i]+', '+data.description2[i],
                                lat_lon:new Microsoft.Maps.Location(parseFloat(data.lat[i]),parseFloat(data.lon[i]))
                            };


// update table
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);
    for (var a = 0; a < 2; a++) {
      var td = document.createElement('TD');
      td.width = window.screen.width;
      if(i==0 & a==0){
        td.appendChild(document.createTextNode("Selected parking slot"));
        tr.appendChild(td);
      }
      else if(i==0 & a==1){
        td.appendChild(document.createTextNode(data.description1[i]));
        tr.appendChild(td);
      }
      // else if(i==0 & a==2){
      //   td.appendChild(document.createTextNode(Math.round(data.distance[i])));
      //   tr.appendChild(td);
      // }
      else if(a==0){
        td.appendChild(document.createTextNode("Parking slot: "+ij));
        tr.appendChild(td);
      }
      else if(a==1){
        td.appendChild(document.createTextNode(data.description1[i]));
        tr.appendChild(td);
      }
      // else if(a==2){
      //   td.appendChild(document.createTextNode(Math.round(data.distance[i])));
      //   tr.appendChild(td);
      // }
    }

                            // map.setView({ center: r.results[0].location ,zoom: 16});
                            //Add a mouse events to the pushpin.
                        Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                        Microsoft.Maps.Events.addHandler(pin, 'mouseover', pushpinHovered);
                        Microsoft.Maps.Events.addHandler(pin, 'mouseout', closeTooltip);
                            map.entities.push(pin);

                        }
                        myTableDiv.appendChild(table);
                        // p = getPushpinById('5');
                        // map.entities.remove(p)
                        map.setView({ center: r.results[0].location ,zoom: 16});
                        go()
                    })
                    .catch(function(error) {
                      console.log(error);
                    });
                }
                myTableDiv.appendChild(table);
                // addTable();
            },
            errorCallback: function (e) {
                //If there is an error, alert the user about it.
                alert("No results found.");
            }
        };
        //Make the geocode request.
        searchManager.geocode(searchRequest);
        //map.entitis.remove(pins);
    }

   