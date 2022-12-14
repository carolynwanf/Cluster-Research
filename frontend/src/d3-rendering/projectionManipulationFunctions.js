import * as d3 from "d3";

// Storing state location data for quicker access
/*
  Schema:
  database = {
    id: {
      cx: float
      cy: float
      label: string
      originalColor: color
    }
  }
  */

// Global variables
let database = {}; // Database of projected points
let colorMap = {}; // Map of label --> color
let globalOpacity = 0.5; // Default opacity
let globalDotSize = 2; // Default dot size

// Clears SVG in the center panel when new data is uploaded
function clearSVG() {
  var svg = d3.select("#containerSVG");
  svg.selectAll("circle").remove(); // Removes plotted points
  svg.selectAll("#lasso").attr("d", ""); // Resets lasso
}

// Function to draw projection, called once at render time and when new data is uploaded
/*
  Schema:
  width = float
  height = float
  uploadedData = [x, y, label, color(if color column selected)]
*/
function drawProjection(width, height, uploadedData) {
  let data = JSON.parse(JSON.stringify(uploadedData));
  // Location var
  const MARGIN = { top: 20, right: 0, bottom: 50, left: 85 },
    SVG_X = width,
    SVG_Y = height,
    PLOT_X = SVG_X - MARGIN.right - MARGIN.left,
    PLOT_Y = SVG_Y - MARGIN.top - MARGIN.bottom;

  var x = d3.scaleLinear().range([MARGIN.left, PLOT_X]),
    y = d3.scaleLinear().range([PLOT_Y, MARGIN.top]);

  // SVG
  var svg = d3.select("#containerSVG");

  // Re-setting database and colorMap and using uploaded data to draw when data has been loaded
  database = {};
  colorMap = {};

  if (data[0].length === 4) {
    makeColorMap(data);
  }

  var d_extent_x = d3.extent(data, (d) => +d[0]),
    d_extent_y = d3.extent(data, (d) => +d[1]);

  // Draw axes
  x.domain(d_extent_x);
  y.domain(d_extent_y);

  // Generate IDs for points
  for (let row of data) {
    row.push(makeid(10));
  }

  // Draw circles
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", globalDotSize)
    .attr("opacity", globalOpacity)
    .attr("id", (d) => {
      let id = d[d.length - 1];
      database[id] = { label: d[2] };
      return id;
    })
    .attr("cx", (d) => {
      let centerX = x(+d[0]);
      database[d[d.length - 1]].cx = centerX;
      return centerX;
    })
    .attr("cy", (d) => {
      let centerY = y(+d[1]);
      database[d[d.length - 1]].cy = centerY;
      return centerY;
    })
    .attr("fill", (d) => {
      if (d.length === 5) {
        return assignColor(d[3], d[4]);
      } else {
        database[d[d.length - 1]].originalColor = "black";
        return "black";
      }
    })
    .attr("class", "non-brushed");

  svg.append("g");
  return colorMap;
}

function makeColorMap(data) {
  let uniqueCategories = new Set();
  for (let item of data) {
    if (uniqueCategories.has(item[3])) {
      continue;
    } else {
      uniqueCategories.add(item[3]);
    }
  }

  let categoriesArray = Array.from(uniqueCategories);
  for (let i = 0; i < categoriesArray.length; i++) {
    colorMap[categoriesArray[i]] = COLORS[i % 11];
  }
}

const COLORS = [
  "#8fd7ff",
  "#71f5ac",
  "#ff66ff",
  "#F2E600",
  "#f7bf6d",
  "#8faa6a",
  "#ff7c78",
  "#e14e3d",
  "#ac8f4c",
  "#003CFF",
  "#9500F2",
];

function assignColor(category, id) {
  database[id].category = category;
  database[id].originalColor = colorMap[category];
  return colorMap[category];
}

// Displays dots based on if the checkbox corresponding to their color is checked
function toggleDotDisplay(checked, color) {
  d3.selectAll("circle")
    .filter(function () {
      if (database[d3.select(this).attr("id")]) {
        return database[d3.select(this).attr("id")].originalColor === color;
      } else {
        return false;
      }
    })
    .attr("visibility", function () {
      if (checked) {
        return "visible";
      } else {
        return "hidden";
      }
    })
    .attr("opacity", function () {
      if (checked) {
        return "1";
      } else {
        return "0";
      }
    });
}

// Check if points are within path on mouseup
function checkPoints() {
  var path = document.getElementById("lasso");
  let svg = document.getElementsByTagName("svg")[0];
  let brushedPoints = [];
  let categorizedPoints = [];
  // d3.polygonContains(lassoPolygon, [x, y]);
  for (let [id, idInfo] of Object.entries(database)) {
    // Ignores point if it's not currently displayed
    if (d3.select("#" + id).attr("visibility") === "hidden") {
      continue;
    }
    const point = svg.createSVGPoint();

    point.x = idInfo.cx;
    point.y = idInfo.cy;
    // Check if point is in path
    if (path.isPointInFill(point)) {
      idInfo.id = id;
      brushedPoints.push(idInfo);
      categorizedPoints.push([idInfo.label, 1]);
      // Change class and recolor points accordingly
      let selector = "#" + id;
      d3.selectAll(selector)
        .attr("class", function () {
          const CURRENT_CLASS = d3.select(this).attr("class");
          if (CURRENT_CLASS.includes("brushed")) {
            return CURRENT_CLASS;
          } else {
            return "brushed";
          }
        })
        .attr("fill", (d, i, elements) => {
          let color = database[id].originalColor;
          if (d3.select(elements[i]).attr("class").includes("brushed")) {
            if (Object.entries(colorMap).length > 0) {
              color = "black";
            } else {
              color = "orange";
            }
          }

          return color;
        });
    } else categorizedPoints.push([idInfo.label, 0]);
  }
  return { brushedPoints: brushedPoints, categorizedPoints: categorizedPoints };
}

// Reset projection to original state
function reset() {
  // Remove word clouds
  d3.select("#positive-cloud").remove();
  d3.select("#negative-cloud").remove();

  // Re-color points
  d3.selectAll("circle")
    .filter(function () {
      if (d3.select(this).attr("class").includes("matches-substring")) {
        return false;
      } else {
        return true;
      }
    })
    .attr("class", "non-brushed")
    .attr("fill", function () {
      let color =
        database[d3.select(this).attr("id")] === undefined
          ? "black"
          : database[d3.select(this).attr("id")].originalColor;
      return color;
    })
    .attr("r", globalDotSize)
    .attr("opacity", globalOpacity);

  // Remove point label
  d3.selectAll(".pointLabel").remove();

  // Reset lasso
  d3.selectAll("#lasso").attr("d", "");
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
function changeDotSize(dotSize) {
  d3.selectAll("circle").attr("r", dotSize);
  globalDotSize = dotSize;
}

function highlightLabel(event) {
  // Reset previously highlighted labels
  d3.selectAll(".brushed")
    .attr("fill", "orange")
    .attr("opacity", globalOpacity)
    .attr("class", "brushed")
    .attr("r", globalDotSize);
  let ids = event.target.id.split(" ");

  // Highlight labels corresponding to ids
  for (let id of ids) {
    d3.select("#" + id)
      .attr("fill", "green")
      .attr("class", "brushed selected")
      .attr("opacity", globalOpacity + 0.5)
      .attr("r", globalDotSize + 2);
  }
}

// Draws tool tip for specific point on hover
function drawToolTip(id, width) {
  let pointInfo = database[id];
  let svg = d3.select("#containerSVG");
  let toolTipWidth = 340;
  let rectPadding = 1;
  let hasCategory = database[id].originalColor !== "black" ? true : false;

  // If dot is on right side of screen, flip tooltip
  let leftflip = false;
  if (pointInfo.cx > width / 2) {
    leftflip = true;
  }

  // If dot is too high up, flip tooltip
  let bottomflip = false;

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
    .text("item: " + pointInfo.label)
    .attr("x", () => {
      if (!leftflip) {
        return rectPadding + "em";
      } else {
        return -toolTipWidth;
      }
    })
    .attr("y", -60 + rectPadding + 12)
    .attr("id", "toyText");

  let lines = wrap(toytext, toolTipWidth - 2 * rectPadding);

  d3.select("#toyText").remove();

  // Rect
  let toolTipHeight = 1.1 * (lines + 1) + 1;

  // Flips tooltip if it's too close to the top
  if (pointInfo.cy < 100) {
    bottomflip = true;
  }

  if (hasCategory) {
    toolTipHeight = 1.1 * (lines + 4) + 1;
  }

  pointLabelContainer
    .append("rect")
    .attr("x", () => {
      if (!leftflip) {
        return 10;
      } else {
        return -(toolTipWidth + 10);
      }
    })
    .attr("y", () => {
      if (!bottomflip) {
        return -3 + "em";
      } else {
        return 0;
      }
    })
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
    .attr("r", globalDotSize + 2);

  pointLabelContainer
    .append("text")
    .text("item: " + pointInfo.label)
    .attr("x", () => {
      if (!leftflip) {
        return rectPadding + "em";
      } else {
        return -toolTipWidth;
      }
    })
    .attr("y", () => {
      if (!bottomflip) {
        return -3 + rectPadding + 0.3 + "em";
      } else {
        return rectPadding + 0.3 + "em";
      }
    })
    .style("z-index", "10")
    .attr("font-family", "Arial")
    .attr("fill", "black")
    .attr("stroke-width", "1px")
    .style("z-index", "10")
    .attr("vector-effect", "non-scaling-stroke")
    .call(wrap, toolTipWidth - 2 * 10);

  // Add category information if has category
  if (hasCategory) {
    pointLabelContainer
      .append("text")
      .text("category: " + pointInfo.category)
      .attr("x", () => {
        if (!leftflip) {
          return rectPadding + "em";
        } else {
          return -toolTipWidth;
        }
      })
      .attr("y", () => {
        if (!bottomflip) {
          return -3 + toolTipHeight - 1.1 + "em";
        } else {
          return toolTipHeight - 1.1 + "em";
        }
      })
      .style("z-index", "10")
      .attr("font-family", "Arial")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .style("z-index", "10")
      .attr("vector-effect", "non-scaling-stroke");
  }
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

// Uses the ID of a point to remove the corresponding tooltip on mouseOut
function eraseToolTip(id) {
  const POINT_CLASS_NAME = d3.select("#" + id).attr("class");

  // Remove the tooltip
  d3.select("#" + id + "label").remove();

  // Reset points to appropriate fill, opacity, and radius based on state
  d3.select("#" + id)
    .attr("fill", () => {
      switch (POINT_CLASS_NAME) {
        case "brushed":
          return "orange";
        case "brushed selected":
          return "green";
        case "matches-substring brushed":
          return "orange";
        default:
          return database[id].originalColor;
      }
    })
    .attr("opacity", () => {
      switch (POINT_CLASS_NAME) {
        case "brushed":
          return globalOpacity;
        case "brushed selected":
          return globalOpacity + 0.5;
        default:
          return globalOpacity;
      }
    })
    .attr("r", () => {
      switch (POINT_CLASS_NAME) {
        case "brushed":
          return globalDotSize;
        case "brushed selected":
          return globalDotSize + 2;
        default:
          return globalDotSize;
      }
    });
}

// Gets centroid of set of points
function getCentroid(points) {
  var first = points[0],
    last = points[points.length - 1];
  if (first.x !== last.x || first.y !== last.y) points.push(first);
  var twicearea = 0,
    x = 0,
    y = 0,
    nPoints = points.length,
    p1,
    p2,
    f;
  for (var i = 0, j = nPoints - 1; i < nPoints; j = i++) {
    p1 = points[i];
    p2 = points[j];
    f = p1.x * p2.y - p2.x * p1.y;
    twicearea += f;
    x += (p1.x + p2.x) * f;
    y += (p1.y + p2.y) * f;
  }
  f = twicearea * 3;
  return { x: x / f, y: y / f };
}

function findMatchingPoints(substring) {
  substring = substring.toLowerCase();
  // Changes opacity of dots to look like something's loading
  // d3.selectAll("circle").attr("opacity", 0.1);

  // TODO: make color black for colored plot
  // Highlight points whose labels match the substring
  const COLORFUL = Object.entries(colorMap).length > 0 ? true : false;

  d3.selectAll("circle")
    .filter(function (d) {
      if (d[2] !== undefined) {
        let lowerCaseLabel = d[2].toLowerCase();
        return lowerCaseLabel.includes(substring);
      } else {
        return false;
      }
    })
    .attr("fill", function (d) {
      if (COLORFUL) {
        return "black";
      } else {
        return "orange";
      }
    })
    .attr("class", "matches-substring brushed")
    .attr("opacity", globalOpacity);
}

function clearSelectedMatchingPoints() {
  d3.selectAll(".matches-substring").attr("class", "brushed");
}

export {
  drawProjection,
  checkPoints,
  reset,
  clearSVG,
  changeOpacity,
  changeDotSize,
  highlightLabel,
  drawToolTip,
  eraseToolTip,
  getCentroid,
  toggleDotDisplay,
  findMatchingPoints,
  clearSelectedMatchingPoints,
};
