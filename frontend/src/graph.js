import * as d3 from "d3";

// Storing state location data for quicker access
let database = {};

function clearSVG() {
  // SVG
  var svg = d3.select("#containerSVG");
  svg.selectAll("circle").remove();
  svg.selectAll("#lasso").attr("d", "");
}

// Function to draw graph, called once at render time
function drawGraph(width, height, dataFromFront) {
  console.log(width, height);
  // Location var
  var margin = { top: 20, right: 0, bottom: 50, left: 85 },
    svg_dx = width,
    svg_dy = height,
    plot_dx = svg_dx - margin.right - margin.left,
    plot_dy = svg_dy - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([margin.left, plot_dx]),
    y = d3.scaleLinear().range([plot_dy, margin.top]);

  // SVG
  var svg = d3.select("#containerSVG");

  // Re-setting database and using uploaded data to draw when data has been loaded
  database = {};
  let d = dataFromFront;

  var d_extent_x = d3.extent(d, (d) => +d[0]),
    d_extent_y = d3.extent(d, (d) => +d[1]);

  // Draw axes
  x.domain(d_extent_x);
  y.domain(d_extent_y);

  // Generate IDs for points
  for (let row of d) {
    row.push(makeid(10));
  }

  // Draw circles
  var circles = svg
    .append("g")
    .selectAll("circle")
    .data(d)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("opacity", 0.5)
    .attr("id", (d) => {
      let id = d[3];
      database[id] = { label: d[2] };
      return id;
    })
    .attr("cx", (d) => {
      let centerX = x(+d[0]);
      database[d[3]].cx = centerX;
      return centerX;
    })
    .attr("cy", (d) => {
      let centerY = y(+d[1]);
      database[d[3]].cy = centerY;
      return centerY;
    })
    .attr("class", "non-brushed");

  svg.append("g");
  console.log(database);
}

// Check if points are within path on mouseup
function checkPoints() {
  console.log(document.getElementsByClassName("non-brushed").length);
  var path = document.getElementById("lasso");
  let svg = document.getElementsByTagName("svg")[0];
  let brushedPoints = [];
  console.log(database);
  console.log(path);
  // d3.polygonContains(lassoPolygon, [x, y]);
  for (let [label, labelInfo] of Object.entries(database)) {
    const point = svg.createSVGPoint();

    point.x = labelInfo.cx;
    point.y = labelInfo.cy;
    // Check if point is in path
    if (path.isPointInFill(point)) {
      brushedPoints.push(labelInfo);
      // Change class and recolor points accordingly
      let selector = "#" + label;
      d3.selectAll(selector)
        .attr("class", "brushed")
        .attr("fill", (d, i, elements) => {
          let color = "black";
          if (d3.select(elements[i]).attr("class") === "brushed") {
            color = "red";
          }

          return color;
        });
    }
  }
  return brushedPoints;
}

// Re-color formerly brushed circles
function reset() {
  d3.selectAll(".brushed").attr("class", "non-brushed").attr("fill", "black");
}

// Make random id strings
function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function changeOpacity(opacity) {
  d3.selectAll("circle").attr("opacity", opacity);
}

export { drawGraph, checkPoints, reset, clearSVG, changeOpacity };
