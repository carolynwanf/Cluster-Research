import * as d3 from "d3";
import cloud from "d3-cloud";

var drawnClouds = false;

function drawClouds(words) {
  let factor = 1.2 / words[0][1];
  console.log(factor);
  // Removes previously drawn clouds
  if (drawnClouds) {
    d3.select("#positive-cloud").remove();
    d3.select("#negative-cloud").remove();
  } else {
    drawnClouds = true;
  }
  var positiveLayout = cloud()
    .size([280, 250])
    .words(
      words.map(function (d) {
        return { text: d[0], size: Math.sqrt(Math.abs(d[1]) * factor) * 20 };
      })
    )
    .padding(2)
    .rotate(function () {
      return 0;
    })
    .font("Helvetica")
    .fontSize(function (d) {
      return d.size;
    })
    .on("end", drawPositive);

  positiveLayout.start();

  function drawPositive(words) {
    d3.select("#pos-cloud-div")
      .append("svg")
      .attr("id", "positive-cloud")
      .attr("width", positiveLayout.size()[0])
      .attr("height", positiveLayout.size()[1])
      .append("g")
      .attr(
        "transform",
        "translate(" +
          positiveLayout.size()[0] / 2 +
          "," +
          positiveLayout.size()[1] / 2 +
          ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", function (d) {
        return d.size + "px";
      })
      .style("font-family", "Helvetica")
      .style("font-weight", 600)
      .attr("text-anchor", "middle")
      .attr("fill", "green")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function (d) {
        return d.text;
      });
  }

  var negativeLayout = cloud()
    .size([280, 250])
    .words(
      words.map(function (d) {
        return { text: d[2], size: Math.sqrt(Math.abs(d[3]) * factor) * 20 };
      })
    )
    .padding(2)
    .rotate(function () {
      return 0;
    })
    .font("Impact")
    .fontSize(function (d) {
      return d.size;
    })
    .on("end", drawNegative);

  negativeLayout.start();

  function drawNegative(words) {
    d3.select("#neg-cloud-div")
      .append("svg")
      .attr("id", "negative-cloud")
      .attr("width", negativeLayout.size()[0])
      .attr("height", negativeLayout.size()[1])
      .append("g")
      .attr(
        "transform",
        "translate(" +
          negativeLayout.size()[0] / 2 +
          "," +
          negativeLayout.size()[1] / 2 +
          ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", function (d) {
        return d.size + "px";
      })
      .style("font-family", "Helvetica")
      .style("font-weight", 600)
      .attr("fill", "red")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function (d) {
        return d.text;
      });
  }
}

export { drawClouds };
