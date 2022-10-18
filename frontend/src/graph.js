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

  var formatIncome = d3.format("$,"),
    formatHsGradAxis = d3.format(".0%");

  var x = d3.scaleLinear().range([margin.left, plot_dx]),
    y = d3.scaleLinear().range([plot_dy, margin.top]);

  // SVG
  var svg = d3.select("#containerSVG");

  // drawing graph with info
  d3.csv(data).then((d) => {
    for (let state of d) {
      database[state.state] = state;
    }
    var n = d.length;
    var d_extent_x = d3.extent(d, (d) => +d.income),
      d_extent_y = d3.extent(d, (d) => +d.hs_grad);

    // Draw axes
    x.domain(d_extent_x);
    y.domain(d_extent_y);

    var axis_x = d3.axisBottom(x).tickFormat(formatIncome),
      axis_y = d3.axisLeft(y).tickFormat(formatHsGradAxis);

    svg
      .append("g")
      .attr("id", "axis_x")
      .attr("transform", "translate(0," + (plot_dy + margin.bottom / 2) + ")")
      .call(axis_x);

    svg
      .append("g")
      .attr("id", "axis_y")
      .attr("transform", "translate(" + margin.left / 2 + ", 0)")
      .call(axis_y);

    d3.select("#axis_x")
      .append("text")
      .attr("transform", "translate(360, -10)")
      .text("Per capita income (1974)");

    d3.select("#axis_y")
      .append("text")
      .attr("transform", "rotate(-90) translate(-20, 15)")
      .text("High-school graduates (1970)");

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

    point.x = stateInfo.cx - 85 / 2;
    point.y = stateInfo.cy - 20 / 2;
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
