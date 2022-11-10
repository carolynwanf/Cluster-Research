import * as d3 from "d3";

// Storing state location data for quicker access
let database = {};
let globalOpacity = 0.5;

function clearSVG() {
  // SVG
  var svg = d3.select("#containerSVG");
  svg.selectAll("circle").remove();
  svg.selectAll("#lasso").attr("d", "");
}

// Function to draw graph, called once at render time
function drawGraph(width, height, dataFromFront) {
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

  var d_extent_x = d3.extent(dataFromFront, (d) => +d[0]),
    d_extent_y = d3.extent(dataFromFront, (d) => +d[1]);

  // Draw axes
  x.domain(d_extent_x);
  y.domain(d_extent_y);

  // Generate IDs for points
  for (let row of dataFromFront) {
    row.push(makeid(10));
  }

  // Draw circles
  svg
    .append("g")
    .selectAll("circle")
    .data(dataFromFront)
    .enter()
    .append("circle")
    .attr("r", 2)
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
  // console.log(database);

  return dataFromFront;
}

// Check if points are within path on mouseup
function checkPoints() {
  var path = document.getElementById("lasso");
  let svg = document.getElementsByTagName("svg")[0];
  let brushedPoints = [];
  // d3.polygonContains(lassoPolygon, [x, y]);
  for (let [id, idInfo] of Object.entries(database)) {
    const point = svg.createSVGPoint();

    point.x = idInfo.cx;
    point.y = idInfo.cy;
    // Check if point is in path
    if (path.isPointInFill(point)) {
      idInfo.id = id;
      brushedPoints.push(idInfo);
      // Change class and recolor points accordingly
      let selector = "#" + id;
      d3.selectAll(selector)
        .attr("class", "brushed")
        .attr("fill", (d, i, elements) => {
          let color = "black";
          if (d3.select(elements[i]).attr("class") === "brushed") {
            color = "orange";
          }

          return color;
        });
    }
  }
  return brushedPoints;
}

// Re-color formerly brushed circles
function reset() {
  d3.selectAll("circle")
    .attr("class", "non-brushed")
    .attr("fill", "black")
    .attr("r", 2)
    .attr("opacity", globalOpacity);
  d3.selectAll(".pointLabel").remove();
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
  globalOpacity = opacity;
}

function highlightLabel(event) {
  // Reset previously highlighted labels
  d3.selectAll(".brushed")
    .attr("fill", "orange")
    .attr("opacity", globalOpacity)
    .attr("class", "brushed")
    .attr("r", 2);
  console.log("highlighting", event.target.id);
  let ids = event.target.id.split(" ");

  // Highlight labels corresponding to ids
  for (let id of ids) {
    d3.select("#" + id)
      .attr("fill", "green")
      .attr("class", "brushed selected")
      .attr("opacity", globalOpacity + 0.5)
      .attr("r", 4);
  }
}

// Draws tool tip for specific point on hover
function drawToolTip(id, width) {
  let pointInfo = database[id];
  let svg = d3.select("#containerSVG");
  let toolTipWidth = 340;
  let rectPadding = 10;

  // If dot is on right side of screen, flip tooltip
  let flip = false;
  if (pointInfo.cx > width / 2) {
    flip = true;
  }
  console.log(flip, width);

  // Draw tooltip of label text with rectangular border
  // g element to hold the rect and text
  var pointLabelContainer = svg
    .append("g")
    .attr("transform", "translate(" + pointInfo.cx + "," + pointInfo.cy + ")")
    .attr("class", "pointLabel")
    .attr("id", id + "label");

  // Text
  let toytext = pointLabelContainer
    .append("text")
    .text(pointInfo.label)
    .attr("x", () => {
      if (!flip) {
        return 10 + rectPadding;
      } else {
        return -toolTipWidth;
      }
    })
    .attr("y", -60 + rectPadding + 12)
    .attr("id", "toyText");

  let lines = wrap(toytext, toolTipWidth - 2 * rectPadding);
  console.log(lines);

  d3.select("#toyText").remove();

  // Rect
  let toolTipHeight = 1.1 * (lines + 1) + 1;
  pointLabelContainer
    .append("rect")
    .attr("x", () => {
      if (!flip) {
        return 10;
      } else {
        return -(toolTipWidth + 10);
      }
    })
    .attr("y", -60)
    .attr("width", toolTipWidth)
    .attr("height", toolTipHeight + "em")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .style("z-index", "1");

  // Change fill/size of the corresponding point
  d3.select("#" + id)
    .attr("fill", "green")
    .attr("opacity", globalOpacity + 0.5)
    .attr("r", 4);

  pointLabelContainer
    .append("text")
    .text(pointInfo.label)
    .attr("x", () => {
      if (!flip) {
        return 10 + rectPadding;
      } else {
        return -toolTipWidth;
      }
    })
    .attr("y", -60 + rectPadding + 12)
    .style("z-index", "10")
    .attr("font-family", "Arial")
    .attr("fill", "black")
    .attr("stroke-width", "1px")
    .style("z-index", "10")
    .attr("vector-effect", "non-scaling-stroke")
    .call(wrap, toolTipWidth - 2 * rectPadding);
}

// Function for wrapping svg text elements
function wrap(text, width) {
  let lines = 0;
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = 0, //parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
    lines = lineNumber;
  });

  return lines;
}

// Function for removing a tooltip from the DOM on mouseOut
function eraseToolTip(id) {
  let className = d3.select("#" + id).attr("class");

  d3.select("#" + id + "label").remove();

  // Resetting points to appropriate fill, opacity, and radius based on state
  d3.select("#" + id)
    .attr("fill", () => {
      if (className === "brushed") {
        return "orange";
      } else if (className === "brushed selected") {
        return "green";
      } else {
        return "black";
      }
    })
    .attr("opacity", () => {
      if (className === "brushed") {
        return globalOpacity;
      } else if (className === "brushed selected") {
        return globalOpacity + 0.5;
      } else {
        return globalOpacity;
      }
    })
    .attr("r", () => {
      if (className === "brushed") {
        return 2;
      } else if (className === "brushed selected") {
        return 4;
      } else {
        return 2;
      }
    });
}

// Gets centroid of set of points
function getCentroid(pts) {
  var first = pts[0],
    last = pts[pts.length - 1];
  if (first.x != last.x || first.y != last.y) pts.push(first);
  var twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];
    f = p1.x * p2.y - p2.x * p1.y;
    twicearea += f;
    x += (p1.x + p2.x) * f;
    y += (p1.y + p2.y) * f;
  }
  f = twicearea * 3;
  return { x: x / f, y: y / f };
}

export {
  drawGraph,
  checkPoints,
  reset,
  clearSVG,
  changeOpacity,
  highlightLabel,
  drawToolTip,
  eraseToolTip,
  getCentroid,
};
