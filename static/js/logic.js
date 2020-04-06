// Store our API endpoint inside queryUrl
var earthquakeURL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesURL =
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(earthquakeURL, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the magnitude, place and time of the earthquake
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h3>Magnitude: " +
          feature.properties.mag +
          "</h3><h3>Location: " +
          feature.properties.place +
          "</h3><hr><h3>" +
          new Date(feature.properties.time) +
          "</h3>"
      );
    },

    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.6,
        color: "#000",
        stroke: true,
        weight: 0.8,
      });
    },
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define streetmap and lightmap layers

  var satellite = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> , Earthquake Data <a href="https://www.usgs.gov/"> USGS Geological Servey</a>',
      maxZoom: 18,
      minZoom: 2,

      id: "mapbox.satellite",

      accessToken: API_KEY,
    }
  );

  var lightmap = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> ,Earthquake Data <a href="https://www.usgs.gov/"> USGS Geological Servey</a>',
      maxZoom: 18,
      minZoom: 2,
      id: "mapbox.light",
      accessToken: API_KEY,
    }
  );

  var dark = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> ,Earthquake Data <a href="https://www.usgs.gov/"> USGS Geological Servey</a>',
      maxZoom: 18,
      minZoom: 2,
      id: "mapbox.dark",
      accessToken: API_KEY,
    }
  );

  // Define a baseMaps object to hold our base layers
  // Pass in our baseMaps
  var baseMaps = {
    Satellite: satellite,
    "Light Map": lightmap,
    Dark: dark,
  };

  // Creat a layer for the tectonic plates
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates,
  };

  // Create our map, giving it the streets, earthquakes and tectonic plates layers to display on load
  var myMap = L.map("map", {
    center: [39.8283, -28.5785],
    zoom: 2.8,
    layers: [satellite, earthquakes, tectonicPlates],
  });

  // Add Fault lines data
  d3.json(tectonicPlatesURL, function (plateData) {
    // Adding our geoJSON data, along with style information, to the tectonicplates
    // layer.
    L.geoJson(plateData, {
      color: "#DC381F",
      weight: 1.2,
    }).addTo(tectonicPlates);
  });

  // Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: true,
    })
    .addTo(myMap);

  //Create a legend on the bottom right
  console.log(earthquakes);

  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = getColor(grades[i] + 1);

    // loop through our density intervals and generate a label with a colored square for each interval

    for (var i = 0; i < grades.length; i++) {
      // console.log(getColor(grades[i] + 1));

      div.innerHTML +=
        '<i style="background-color:' +
        getColor(grades[i] + 1) +
        ';">' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" + "</i> " : "+");
    }
    return div;
  };

  legend.addTo(myMap);
}

//Create color range for the circle diameter
function getColor(d) {
  return d > 5
    ? "red"
    : d > 4
    ? "orange"
    : d > 3
    ? "gold"
    : d > 2
    ? "yellow"
    : d > 1
    ? "yellowgreen"
    : "greenyellow"; // <= 1 default
}

//Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle.
function getRadius(value) {
  return value * 50000;
}
