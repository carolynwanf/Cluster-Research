import data from "./states.csv";
import * as d3 from "d3";

// Storing state location data for quicker access
let database = {};

// Function to draw graph, called once at render time
function drawGraph() {
  // Location var
  var margin = { top: 20, right: 0, bottom: 50, left: 85 },
    svg_dx = 500,
    svg_dy = 400,
    plot_dx = svg_dx - margin.right - margin.left,
    plot_dy = svg_dy - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([margin.left, plot_dx]),
    y = d3.scaleLinear().range([plot_dy, margin.top]);

  // SVG
  var svg = d3.select("#containerSVG");

  // drawing graph with info
  d3.csv(data).then((d) => {
    for (let state of d) {
      database[state.state] = state;
    }

    var d_extent_x = d3.extent(d, (d) => +d.income),
      d_extent_y = d3.extent(d, (d) => +d.hs_grad);

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
      .attr("r", 5)
      .attr("cx", (d) => {
        let centerX = x(+d.income);
        database[d.state].cx = centerX;
        return centerX;
      })
      .attr("cy", (d) => {
        let centerY = y(+d.hs_grad);
        database[d.state].cy = centerY;
        return centerY;
      })
      .attr("class", "non-brushed")
      .attr("id", (d) => d.state.replace(/\s+/g, ""));

    svg.append("g");
  });
}

// Check if points are within path on mouseup
function checkPoints() {
  console.log(document.getElementsByClassName("non-brushed").length);
  var path = document.getElementById("lasso");
  let svg = document.getElementsByTagName("svg")[0];

  console.log(path);
  // d3.polygonContains(lassoPolygon, [x, y]);
  for (let [state, stateInfo] of Object.entries(database)) {
    const point = svg.createSVGPoint();

    point.x = stateInfo.cx;
    point.y = stateInfo.cy;
    // Check if point is in path
    if (path.isPointInFill(point)) {
      // Change class and recolor points accordingly
      let id = state.replace(/\s+/g, "");
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
}

// Re-color formerly brushed circles
function reset() {
  d3.selectAll(".brushed").attr("class", "non-brushed").attr("fill", "black");
}

export { drawGraph, checkPoints, reset };
