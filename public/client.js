  var socket = io.connect(window.location.hostname + ':' + 3000);
  var lat = document.getElementById('lat');
  var long = document.getElementById('long');
  var alt = document.getElementById('alt');
  var heading = document.getElementById('heading');
  var bearing = document.getElementById('bearing');
  var pressure = document.getElementById('pressure');
  var detect = document.getElementById('detected');
  let locationA = {lat: 36.374934, lng: 127.389251};
  let map, marker, marker2;

  socket.on('connect', function(data) {
      socket.emit('join', 'Client is connected!');
  });

  socket.on('position', function(data) {
    console.log("position  received");
    marker.setPosition(data);
  });

  socket.on('data', function(data) {
      var type = data.type;
      lat.innerHTML = `Latitude: ${data.lat}`;
      long.innerHTML = `Longitude: ${data.long}`;
      alt.innerHTML = `Altitude: ${data.alt}m`;
      heading.innerHTML = `Heading: ${data.heading}`;
      pressure.innerHTML = `Pressure: ${data.pressure}kPa`
      if(data.detected) {
        locationA.lat = data.pos[0];
        locationA.lng = data.pos[1];
        detect.innerHTML = `Laser Detected! Attacker Position is at (${data.pos[0]}, ${data.pos[1]})`;
        console.log("laser detected!");
        map.setCenter(locationA);
        // map.setZoom(19);
        marker2.setPosition(locationA);
        detect.style.display = '';
        setTimeout(function() {
          detect.style.display = 'none';
        }, 4000);
      }
  });

  function initMap() {
    console.log("intialized");
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: {lat: 36.374934, lng: 127.389251}
    });
    marker = new google.maps.Marker({
      position: locationA,
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    marker2 = new google.maps.Marker({
      map: map
    });
  }