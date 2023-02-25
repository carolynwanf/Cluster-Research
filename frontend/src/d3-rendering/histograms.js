import * as d3 from "d3";
var drawnHist = false;


function drawHistograms(data) {
    if (drawnHist) {
        d3.selectAll("#positive-cloud").remove();
      } else {
        drawnHist = true;
      }


      for (let i = 0; i < data[0][1].length; i++) {
        drawHistogram(data, i)
      }
}


function drawHistogram(data, k) {
 

    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 300 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#positive-cloud-div")
    .append("svg")
    .attr("id", "positive-cloud")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");




    const selected = data.filter(i => i[2] != 0);
    const val_to_hist = selected.map(i => i[1][k]);

    console.log(selected);


    // X axis: scale and draw:
    var x = d3.scaleLinear()
    .domain([d3.min(data, function(d) { return +d[1][k]}), d3.max(data, function(d) { return +d[1][k] })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([0, width]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // set the parameters for the histogram
    var histogram = d3.histogram()
    .value(function(d) { console.log(d[1][k]);return d[1][k]; })   // I need to give the vector of value
    .domain(x.domain())  // then the domain of the graphic
    .thresholds(x.ticks(10)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(selected);

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
    .range([height, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
    .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", 1)
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
    .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
    .attr("height", function(d) { return height - y(d.length); })
    .style("fill", "#69b3a2")

}



export { drawHistograms };


