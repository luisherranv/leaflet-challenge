// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

  function createFeatures(earthquakeData) {




    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }
    
    function pointToLayer(feature, latlng) {
        // Define the radius based on the magnitude of the earthquake
        let radius = Math.sqrt(Math.abs(feature.properties.mag)) * 5;
        let depth = feature.geometry.coordinates[2];
        let color = "";
        if (depth > 90){
            color = "red";
        }
        else if (depth > 70){
            color = "orange"; 
        }   
        else if (depth > 50){
            color = "#ffcc00"; //light orange
        }        
        else if (depth > 30){
            color = "yellow"; 
        }
        else if (depth > 10){
            color = "#80ff00"; //light green
        }
        else {
            color = "green"
        }
        
        // Create and return the circle marker
        return L.circleMarker(latlng, {
            radius: radius,
            fillColor: color,
            // color: "#000",
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    // Create a legend control
    let legend = L.control({ position: 'bottomright' });
  
    // Function to generate the legend content
    legend.onAdd = function(map) {
      let div = L.DomUtil.create('div', 'info legend');
      let grades = [0, 10, 30, 50, 70, 90]; // Adjust these values based on your data
      let labels = [];
  
      // Loop through the grades and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<h2 style="background:' + getColor(grades[i] + 1) + '">' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</h2>' : '+');
      }
      return div;
    };
  
    // Add legend to the map
    legend.addTo(myMap);
  }
  
  function getColor(d) {
    return d < 10 ? "yellow" :
      d < 30 ? '#80ff00' :
      d < 50 ? '#ffff00' :
      d < 70 ? '#ffcc00' :
      d < 90 ? 'orange' :
      'red';
  }