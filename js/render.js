//Draw Function

var xScale;
var yScale;
var xScaleContext;
var yScaleContext;
var focus;
var context;
var left;
var xMin, xMax;

function draw(nodes, edges) {
    xMin = d3.min(nodes, d => d['x']);
    xMax = d3.max(nodes, d => d['x']);

    d3.selectAll("#brushContainer > *").remove();
    d3.selectAll('#svgContainer > *').remove();

    drawGraph(nodes, edges);
    drawBrush(nodes, edges);
}

/**
 * Function to draw the graph 
 * 
 * @param {list[objects]} nodes 
 * @param {list[objects]} edges 
 */

 function drawGraph(nodes, edges) {
    var clientWidth = document.getElementById('svgContainer').clientWidth;
    var clientHeight = document.getElementById('svgContainer').clientHeight;
  
    var top = clientHeight * 0.2;
    var bottom = clientHeight * 0.8;
  
    left = clientWidth * 0.02;
    var right = clientWidth * 0.98;
  
    var lMin = d3.min(nodes, d => d['layer']);
    var lMax = d3.max(nodes, d => d['layer']);

    //TODO
    xScale = d3.scaleLinear().domain([xMin, xMax]).range([left, right]);
    yScale = d3.scaleLinear().domain([lMax, lMin]).range([top, bottom]);
  
 
    focus = d3.select("#svgContainer")
  
    var layer2 = focus
    .append('g')
  
    var layer1 = focus
    .append('g')
  
  
    layer1
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr('class', 'node')
      .attr("r", 5)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.layer))
      .style("fill", "red");
  
    layer2
      .selectAll('.edge')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => xScale(d.source.x))
      .attr('x2', d => xScale(d.target.x))
      .attr('y1', d => yScale(d.source.layer))
      .attr('y2', d => yScale(d.target.layer))
      .style("opacity", 1.0)
      .style("stroke-width", d => d.weight);
  
    layer1
      .selectAll('.label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.layer) + 10)
      .html(d => d.label)
      .style('align', 'center')
      .style('shape-rendering', 'crisp-edges')
      .style('stroke', 'none')
      .style('font-size', 12)
  }
  
  function drawBrush(nodes, edges) {
    var clientWidth = document.getElementById('brushContainer').clientWidth;
    var clientHeight = document.getElementById('brushContainer').clientHeight;
  
    var margin = clientHeight * 0.05
    var top = clientHeight * 0.2;
    var bottom = clientHeight * 0.8;
  
    var left = clientWidth * 0.02;
    var right = clientWidth * 0.98;
  
    var lMin = d3.min(nodes, d => d['layer']);
    var lMax = d3.max(nodes, d => d['layer']);
  
    xScaleContext = d3.scaleLinear().domain([xMin, xMax]).range([left, right]);
    yScaleContext = d3.scaleLinear().domain([lMax, lMin]).range([top, bottom]);
   
    var brush = d3.brushX()
    .extent([[margin, 0], [clientWidth - margin, clientHeight]])
    .on("brush", brushed)
    .on('end', brushedEnd)
  
  
    context = d3.select("#brushContainer")
  
    var layer2 = context
    .append('g')
  
    var layer1 = context
    .append('g')
  
  
    layer1
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr('class', 'node')
      .attr("r", 5)
      .attr('cx', d => xScaleContext(d.x))
      .attr('cy', d => yScaleContext(d.layer))
      .style("fill", "grey");
  
    layer2
      .selectAll('.edge')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => xScaleContext(d.source.x))
      .attr('x2', d => xScaleContext(d.target.x))
      .attr('y1', d => yScaleContext(d.source.layer))
      .attr('y2', d => yScaleContext(d.target.layer))
      .style("opacity", 1.0)
      .style("stroke-width", d => d.weight);
  
    context
    .append('g')
    .call(brush)
    .call(brush.move, xScaleContext)
  
  }
  
  function brushed(event) { 
    const selection = event.selection;
    var circle = context.selectAll('.node');
    
    if (selection === null) {
      circle.attr("stroke", null);
    } else {
      const [x0, x1] = selection.map(xScaleContext.invert);
      circle.attr("stroke", d => x0 <= d.x && d.x <= x1 ? "red" : null);
    }
  }
  
  function brushedEnd(event) { 
    const selection = event.selection;
  
    if (selection === null) {
      xScale.domain([xMin, xMax]);
  
      context.selectAll('.node').attr("stroke", null);
  
    } else {
      selection[0] = selection[0]
      selection[1] = selection[1]
      const [x0, x1] = selection.map(xScaleContext.invert);
      xScale.domain([x0, x1]);
    }
  
    focus.selectAll(".node")
        .transition()
        .duration(1000)
        .attr("cx", function (d) { return xScale(d.x); } )
  
    focus.selectAll(".edge")
        .transition()
        .duration(1000)
        .attr('x1', d => xScale(d.source.x))
        .attr('x2', d => xScale(d.target.x))
  
    focus.selectAll(".label")
        .transition()
        .duration(1000)
        .attr('x', d => xScale(d.x) + 10)
    
  }
  
  function addInteractivity() {
  
  }