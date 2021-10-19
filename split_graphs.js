function findMins(n_top, arr)
{
  var min1 = -1;
  for(var i=0;i<arr.length;i++)
  {
    if(min1==-1)
    {
      if(parseInt(arr[i])<n_top)
        min1 = i;
    }
    else if(parseInt(arr[min1])>parseInt(arr[i]))
    {
      min1 = i;
    }
  }
  var min2 = -1;
  for(var i=0;i<arr.length;i++)
  {
    if(i==min1)continue;
    else if(min2==-1)
    {
      if(parseInt(arr[i])<n_top)
        min2 = i;
    }
    else if(parseInt(arr[min2])>parseInt(arr[i]))
    {
      min2 = i;
    }
  }
  return {"min1":min1, "min2":min2};
}

function delete_val(dict, val)
{
  var keys = Object.keys(dict);
  for(var i=0;i<keys.length;i++)
  {
    if(dict[keys[i]]==val)delete dict[keys[i]];
  }
}

// All top vertices are ordered from 0 to |V_t|-1
// The bottom vertices are numbered from |V_t| to |V_t|+|V_b|-1
// We need to return pi_b = bottom_order
// adj is the adjacency list
// n_top = |V_t|
// bottom_degree contains the degree of the bottom vertices
function crossing_removal_k_split(n_top, adj, bottom_order, bottom_degree){
  var V = Object.keys(adj);
  var mins = findMins(n_top, V);
  if(mins.min2==-1)
  {
    if(mins.min1!=-1)
    {
      var u = V[mins.min1];
      var N_u = Object.values(adj[u]);
      for(var i=0;i<N_u.length;i++)
      {
        bottom_order.push(N_u[i]);
        bottom_degree.push(1);
      }
    }
    return;
  }
  var u = V[mins.min1];
  var v = V[mins.min2];
  var N_u = Object.values(adj[u]);
  var N_v = Object.values(adj[v]);
  var common_neighbors = [];
  for(var i=0;i<N_u.length;i++)
  {
    if(N_v.indexOf(N_u[i])!=-1)
    {
      common_neighbors.push(N_u[i]);
    }
  }
  var first_common = -1;
  if(common_neighbors.length>0)first_common = common_neighbors[0];
  for(var i=0;i<N_u.length;i++)
  {
    if(N_u[i]==first_common)continue;
    var N_w_dict = adj[N_u[i]+""];
    bottom_order.push(N_u[i]);
    bottom_degree.push(1);
    delete_val(N_w_dict, parseInt(u));
    if(Object.keys(N_w_dict).length==0)delete adj[N_u[i]+""];
  }
  if(first_common!=-1)
  {
    var N_w_dict = adj[first_common+""];
    bottom_order.push(first_common);
    bottom_degree.push(2);
    delete_val(N_w_dict, parseInt(u));
    delete_val(N_w_dict, parseInt(v));
    if(Object.keys(N_w_dict).length==0)delete adj[N_u[i]+""];
    delete_val(adj[v], first_common);
  }
  delete adj[u];
  crossing_removal_k_split(n_top, adj, bottom_order, bottom_degree);
}
function draw()
{
  d3.select("svg").selectAll("*").remove();
  var txt = document.getElementById("input_text").value;
  var lines = txt.split('\n');
  var all_edges = [];
  var edge_list = [];
  var node_list = [];
  var all_nodes = [];
  var n_top = parseInt(lines[0].replace(/\s/g, ""));
  var adj = {};
  for(var i=1;i<lines.length;i++)
  {
    if(lines[i].replace(/\s/g, "")=="")continue;
    var edge = lines[i].split("--");
    edge[0] = edge[0].replace(/\s/g, "");
    edge[1] = edge[1].replace(/\s/g, "");
    if(Object.keys(adj).indexOf(edge[0])==-1)adj[edge[0]] = {};
    if(Object.keys(adj).indexOf(edge[1])==-1)adj[edge[1]] = {};
    adj[edge[0]][Object.keys(adj[edge[0]]).length+""] = parseInt(edge[1]);
    adj[edge[1]][Object.keys(adj[edge[1]]).length+""] = parseInt(edge[0]);
    if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }
  //node_list.push(all_edges[0].source_label);
  all_edges.reverse();
  window.all_edges = all_edges;
  //console.log(edge_list);
  //console.log(node_list);
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  //var fx = [300, 500, 300, 500];
  //var fy = [100, 300, 300, 100];
  var nodes = [];
  //for(var i=0;i<node_list.length;i++)
  var top_x = 300;
  var bot_x = 300;
  for(var i=0;i<all_nodes.length;i++)
  {
    //nodes.push({"label":all_nodes[i], "fx":fx[i], "fy":fy[i]});
    if(parseInt(all_nodes[i])<n_top)
    {
      nodes.push({"label":all_nodes[i], "fx":top_x, "fy":100});
      top_x += 200;
    }
    else
    {
      nodes.push({"label":all_nodes[i], "fx":bot_x, "fy":300});
      bot_x += 200;
    }
  }

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  //edge_list.forEach(edge => {
  all_edges.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })

  console.log(all_edges);

  //var manyBody = d3.forceManyBody().strength(-50 * stability);
  var manyBody = d3.forceManyBody().strength(-50);
  //var forceLink = d3.forceLink().strength(stability);
  var forceLink = d3.forceLink();
  var center = d3.forceCenter().x(width/2).y(height/2);

  var simulation = d3.forceSimulation()
   .force("charge", manyBody)
   .force("center", center)
   .force("link", forceLink)
   .nodes(nodes)
   .on("tick", updateNetwork);  
  window.simulation = simulation;

  //simulation.force("link").links(edge_list);
  simulation.force("link").links(all_edges);

  d3.select("svg")
   .selectAll("circle")
   .data(nodes)
   .enter()
   .append("circle")
   .style("fill", "red")
   .attr("r", 5);

  d3.select("svg").selectAll("line.link")
   //.data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   .data(all_edges, d => `${d.source_label}-${d.target_label}`) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

  function updateNetwork() {
   d3.selectAll("circle")
     .attr("cx", d => d.x)
     .attr("cy", d => d.y);
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);
  }

  var bottom_order = [];
  var bottom_degree = [];
  var adj = {0:{0:2, 1:3}, 1:{0:2, 1:3}, 2:{0:0, 1:1}, 3:{0:0,1:1}};
  crossing_removal_k_split(2, adj, bottom_order, bottom_degree);
  console.log("bottom_order", bottom_order);
  console.log("bottom_degree", bottom_degree);

}

function addEdge()
{
  if(window.all_edges.length>0)
  {
    var simulation = window.simulation;
    var edge = window.all_edges.pop();
    var sourceIndex = simulation.nodes().findIndex(d => d.label == edge.source_label);
    var sourceNode = simulation.nodes()[sourceIndex];
    var targetNodeLabel = edge.target_label;
    simulation.stop();
    var oldEdges = simulation.force("link").links()
    var oldNodes = simulation.nodes()
    var newNode = {"label":targetNodeLabel, x: sourceNode.x, y: sourceNode.y};
    var newEdge = {source: sourceNode, target: newNode};
    oldEdges.push(newEdge);
    oldNodes.push(newNode);
    simulation.force("link").links(oldEdges);
    simulation.nodes(oldNodes);

    d3.select("svg")
     .selectAll("circle")
     .data(oldNodes)
     .enter()
     .append("circle")
     .style("fill", "red")
     .attr("r", 5);

    d3.select("svg").selectAll("line.link")
     .data(oldEdges, d => `${d.source_label}-${d.target_label}`) .enter()
     .append("line")
     .attr("class", "link")
     .style("opacity", .5)
     .style("stroke-width", d => d.weight);

    simulation.alpha(0.1);
    simulation.restart();
  }
  else
  {
    clearInterval(window.addEdgeInterval);
  }
}

function split()
{
  d3.select("svg").selectAll("*").remove();
  var txt = "1--3\n1--4\n2--3\n2--5";
  var lines = txt.split('\n');
  var all_edges = [];
  var edge_list = [];
  var node_list = [];
  var all_nodes = [];
  for(var i=0;i<lines.length;i++)
  {
    if(lines[i].replace(/\s/g, "")=="")continue;
    var edge = lines[i].split("--");
    edge[0] = edge[0].replace(/\s/g, "");
    edge[1] = edge[1].replace(/\s/g, "");
    if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }
  console.log(all_edges);
  //node_list.push(all_edges[0].source_label);
  all_edges.reverse();
  window.all_edges = all_edges;
  //console.log(edge_list);
  //console.log(node_list);
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  var fx = [300, 400, 200, 500, 600];
  var fy = [100, 300, 300, 100, 300];
  var nodes = [];
  //for(var i=0;i<node_list.length;i++)
  for(var i=0;i<all_nodes.length;i++)
  {
    nodes.push({"label":all_nodes[i], "fx":fx[i], "fy":fy[i]});
  }

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  //edge_list.forEach(edge => {
  all_edges.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })

  console.log(all_edges);

  //var manyBody = d3.forceManyBody().strength(-50 * stability);
  var manyBody = d3.forceManyBody().strength(-50);
  //var forceLink = d3.forceLink().strength(stability);
  var forceLink = d3.forceLink();
  var center = d3.forceCenter().x(width/2).y(height/2);

  var simulation = d3.forceSimulation()
   .force("charge", manyBody)
   .force("center", center)
   .force("link", forceLink)
   .nodes(nodes)
   .on("tick", updateNetwork);  
  window.simulation = simulation;

  //simulation.force("link").links(edge_list);
  simulation.force("link").links(all_edges);

  d3.select("svg")
   .selectAll("circle")
   .data(nodes)
   .enter()
   .append("circle")
   .style("fill", "red")
   .attr("r", 5);

  d3.select("svg").selectAll("line.link")
   //.data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   .data(all_edges, d => `${d.source_label}-${d.target_label}`) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

  function updateNetwork() {
   d3.selectAll("circle")
     .attr("cx", d => d.x)
     .attr("cy", d => d.y);
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);
  }


}
