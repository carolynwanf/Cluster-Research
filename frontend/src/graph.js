import * as d3 from "d3";

let data = [
  [(3615, 3624, "Alabama")],
  [365, 6315, "Alaska"],
  [2212, 4530, "Arizona"],
  [2110, 3378, "Arkansas"],
  [21198, 5114, "California"],
  [2541, 4884, "Colorado"],
  [3100, 5348, "Connecticut"],
  [579, 4809, "Delaware"],
  [8277, 4815, "Florida"],
  [4931, 4091, "Georgia"],
  [868, 4963, "Hawaii"],
  [813, 4119, "Idaho"],
  [11197, 5107, "Illinois"],
  [5313, 4458, "Indiana"],
  [2861, 4628, "Iowa"],
  [2280, 4669, "Kansas"],
  [3387, 3712, "Kentucky"],
  [3806, 3545, "Louisiana"],
  [1058, 3694, "Maine"],
  [4122, 5299, "Maryland"],
];

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

  // drawing graph with info
  data.shift();
  let d = data;
  console.log("d", d);
  if (dataFromFront.length > 0) {
    d = dataFromFront;
  }

  for (let [x, y, label] of d) {
    database[label] = { label: label };
  }

  var d_extent_x = d3.extent(d, (d) => +d[0]),
    d_extent_y = d3.extent(d, (d) => +d[1]);

  // Draw axes
  x.domain(d_extent_x);
  y.domain(d_extent_y);

  // Draw circles
  var circles = svg
    .append("g")
    .selectAll("circle")
    .data(d)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("opacity", 0.5)
    .attr("cx", (d) => {
      let centerX = x(+d[0]);
      database[d[2]].cx = centerX;
      return centerX;
    })
    .attr("cy", (d) => {
      let centerY = y(+d[1]);
      database[d[2]].cy = centerY;
      return centerY;
    })
    .attr("class", "non-brushed")
    .attr("id", (d) => {
      let id = d[2].replace(/\s+/g, "");
      id = id;
    });

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
      let id = label.replace(/\s+/g, "");
      let selector = "#" + id;
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

export { drawGraph, checkPoints, reset, clearSVG };
