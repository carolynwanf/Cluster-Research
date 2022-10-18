import data from "./states.csv";
import * as d3 from "d3";

let database = {};

function drawGraph() {
  var margin = { top: 20, right: 0, bottom: 50, left: 85 },
    svg_dx = 500,
    svg_dy = 400,
    plot_dx = svg_dx - margin.right - margin.left,
    plot_dy = svg_dy - margin.top - margin.bottom;

  var formatIncome = d3.format("$,"),
    formatHsGrad = d3.format(".1%"),
    formatHsGradAxis = d3.format(".0%");

  var x = d3.scaleLinear().range([margin.left, plot_dx]),
    y = d3.scaleLinear().range([plot_dy, margin.top]);

  var svg = d3.select("svg");
  console.log(svg);
  // drawing graph with info
  d3.csv(data).then((d) => {
    for (let state of d) {
      database[state.state] = state;
    }
    var n = d.length;
    console.log(d, n);
    var d_extent_x = d3.extent(d, (d) => +d.income),
      d_extent_y = d3.extent(d, (d) => +d.hs_grad);

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

function checkPoints() {
  console.log(document.getElementsByClassName("non-brushed").length);
  var path = document.getElementById("lasso");
  let svg = document.getElementsByTagName("svg")[0];

  for (let [state, stateInfo] of Object.entries(database)) {
    // console.log(state, stateInfo);
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

function reset() {
  // re-color formerly brushed circles
  d3.selectAll(".brushed").attr("class", "non-brushed").attr("fill", "black");
}

export { drawGraph, checkPoints, reset };
