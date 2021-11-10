
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
// top start is the index of the leftmost top vertex
// reuse_last_bot indicates there was a neighbor that is common between current top node and previous top node
function crossing_removal_k_split(top_start, n_top, adj, bottom_order, bottom_degree, reuse_last_bot){
  console.log("bot degree start", JSON.stringify(bottom_degree));
  var V = Object.keys(adj);

  // If there is a common neighbor with previous node, add the edge with common neighbor
  if(reuse_last_bot)
  {
    bottom_degree[bottom_degree.length-1] += 1;
    var u = top_start+"";
    var N_u = Object.values(adj[u]);
    var bot_ngbr = bottom_order[bottom_order.length-1];
    var N_w_dict = adj[bot_ngbr+""];
    delete_val(N_w_dict, parseInt(u));
    delete_val(adj[u], bot_ngbr);
    if(Object.keys(N_w_dict).length==0)delete N_w_dict;
    else{
      // we know there are multiple vertices at top
      var v = (top_start+1)+"";
      var N_v = Object.values(adj[v]);
      // we need to check whether we are done with u, and do bot_ngbr is a neighbor of v too
      // check the degree of u
      if((N_u.length==1)&&(N_v.indexOf(bot_ngbr)!=-1))reuse_last_bot = true;
      else reuse_last_bot = false;
    }
    if(N_u.length==1)
    {
      delete adj[u];
      crossing_removal_k_split(top_start+1, n_top, adj, bottom_order, bottom_degree, reuse_last_bot);
    }
  }

  //var mins = findMins(n_top, V);
  //if(mins.min2==-1)
  if((top_start+1)>=n_top)
  {
    //if(mins.min1!=-1)
    if(top_start<n_top)
    {
      //var u = V[mins.min1];
      var u = top_start+"";
      var N_u = Object.values(adj[u]);
      for(var i=0;i<N_u.length;i++)
      {
        bottom_order.push(N_u[i]);
        bottom_degree.push(1);
      }
    }
    return;
  }

  //var u = V[mins.min1];
  //var v = V[mins.min2];
  var u = top_start+"";
  var v = (top_start+1)+"";
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
  console.log("common_neighbors", common_neighbors);
  var first_common = -1;
  reuse_last_bot = false;
  if(common_neighbors.length>0)
  {
    first_common = common_neighbors[0];
    reuse_last_bot = true;
  }
  for(var i=0;i<N_u.length;i++)
  {
    if(N_u[i]==first_common)continue;
    var N_w_dict = adj[N_u[i]+""];
    bottom_order.push(N_u[i]);
    bottom_degree.push(1);
    delete_val(N_w_dict, parseInt(u));
    if(Object.keys(N_w_dict).length==0)delete N_w_dict;
  }
  if(first_common!=-1)
  {
    var N_w_dict = adj[first_common+""];
    bottom_order.push(first_common);
    //bottom_degree.push(2);
    bottom_degree.push(1);
    delete_val(N_w_dict, parseInt(u));
    //delete_val(N_w_dict, parseInt(v));
    //if(Object.keys(N_w_dict).length==0)delete N_w_dict;
    //delete_val(adj[v], first_common);
  }
  delete adj[u];
  crossing_removal_k_split(top_start+1, n_top, adj, bottom_order, bottom_degree, reuse_last_bot);
  console.log("bot degree end", JSON.stringify(bottom_degree));
}
function get_next_layer(cur_layer, edges, nodes)
{
  var next_layer = new Set();
  //var next_layer_type = new Set();
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    if(cur_layer.has(edge.source))
    {
      next_layer.add(edge.target);
      //next_layer_type.add(nodes[edge.target].type);
    }
  }
  return next_layer;
}
function transfer_id(source_ids, target_ids, edges)
{
  var org_to_consecutive = {};
  var consecutive_to_org = {};
  var source_degree = {};
  var target_degree = {};
  for(let u of source_ids)source_degree[u]=0;
  for(let u of target_ids)target_degree[u]=0;
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    source_degree[edge.source]++;
    target_degree[edge.target]++;
  }
  var n_top = 0;
  for(let v of source_ids)
  {
    if(source_degree[v]==0)continue;
    org_to_consecutive[v] = n_top;
    consecutive_to_org[n_top] = v;
    n_top++;
  }
  var i = n_top;
  for(let v of target_ids)
  {
    if(target_degree[v]==0)continue;
    if(source_ids.has(v))continue;
    org_to_consecutive[v] = i;
    consecutive_to_org[i] = v;
    i++;
  }
  return {"map1":org_to_consecutive, "map2":consecutive_to_org, "n_top":n_top, "n":i};
}
function show_degree(v, edges)
{
  var d = 0;
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    if(edge.source==v)
    {
      d += 1;
    }
  }
  return d;
}
function process_hubmap_data()
{
  var txt = document.getElementById("input_text").value;
  var G_json = JSON.parse(txt);
  var nodes = G_json["nodes"];
  var edges = G_json["edges"];
  var root_layer = new Set();
  root_layer.add(0);

  var nodes_layer2 = get_next_layer(root_layer, edges, nodes);
  var nodes_layer3 = get_next_layer(nodes_layer2, edges, nodes);
  var nodes_layer4 = get_next_layer(nodes_layer3, edges, nodes);

  var duplicate = true;
  while(duplicate)
  {
    duplicate = false;
    var edge_set = new Set();
    for(var i=0;i<edges.length;i++)
    {
      var edge = edges[i];
      var cur_str = edge.source+","+edge.target;
      if(edge_set.has(cur_str))
      {
        duplicate = true;
        edges.splice(i, 1);
        console.log("Removing duplicate", cur_str);
        break;
      }
      edge_set.add(edge.source+","+edge.target);
    }
  }

  ///*
  var split_top = true;
  var top_layer = null;
  var bot_layer = null;
  var res = null;
  /*
  nodes_layer3 = new Set();
  for(var i=0;i<8;i++)
  {
    nodes_layer3.add(i+3);
    console.log("Degree of "+(i+3), show_degree(i+3, edges));
  }
  */
  if(split_top)
  {
    top_layer = nodes_layer3;
    bot_layer = nodes_layer4;
    res = transfer_id(top_layer, bot_layer, edges);
  }
  var simple_jsn = {"n_top":res["n_top"]};
  simple_jsn["edges"] = [];
  simple_jsn["node_id_to_txt"] = {};
  var org_to_consecutive = res["map1"];
  var consecutive_to_org = res["map2"];
  console.log("org_to_consecutive", org_to_consecutive);
  console.log("consecutive_to_org", consecutive_to_org);
  var n_vertices = res["n"];
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    var is_edge = false;
    if(nodes_layer3.has(edge.source)&&nodes_layer4.has(edge.target))
    {
      is_edge = true;
    }
    if(is_edge)
    {
      var s_id = org_to_consecutive[edge.source];
      var t_id = org_to_consecutive[edge.target];
      simple_jsn["edges"].push({"source":s_id, "target":t_id});
    }
  }
  for(var i=0;i<n_vertices;i++)
  {
    simple_jsn["node_id_to_txt"][i+""] = nodes[consecutive_to_org[i]].name;
  }
  //*/

  /*
  var simple_jsn = {
        "n_top":2,
        "edges": [{"source":0, "target":2},
          {"source":0, "target":3},
          {"source":1, "target":2},
          {"source":1, "target":3},
          {"source":0, "target":4},
          {"source":1, "target":4},
          {"source":0, "target":5},
          {"source":1, "target":5},
          {"source":0, "target":6},
          {"source":1, "target":6}
        ],
        "node_id_to_txt": {"0":"Bone marrow", "1":"Blood", "2":"basophil", "3":"CD14 monocyte", "4":"CD16 monocyte", "5":"CD4 naÃ¯ve", "6":"CD4 T cell effector memory CD45RA"}
  };
  */
  return simple_jsn;
}
function generate_coordinates(all_nodes, n_top, node_id_to_txt)
{
  var nodes = [];
  var left_y = 300;
  var right_y = 300;
  for(var i=0;i<all_nodes.length;i++)
  {
    if(parseInt(all_nodes[i])<n_top)
    {
      nodes.push({"label":all_nodes[i], "txt":node_id_to_txt[all_nodes[i]], "x":100, "y":left_y});
      left_y += 200;
    }
    else
    {
      nodes.push({"label":all_nodes[i], "txt":node_id_to_txt[all_nodes[i]], "x":600, "y":right_y});
      right_y += 200;
    }
  }
  var max_y = Math.max(left_y, right_y);
  d3.select("svg").style("height", (max_y+100)+"px");
  return nodes;
}
function draw()
{
  var G_json = process_hubmap_data();
  console.log("G_json", G_json);
  d3.select("svg").selectAll("*").remove();
  //var txt = document.getElementById("input_text").value;

  //var G_json = JSON.parse(txt);
  var all_edges = [];
  var all_nodes = [];
  var n_top = G_json["n_top"];
  var adj = {}
  for(var i=0;i<G_json["edges"].length;i++)
  {
    var edge = [G_json["edges"][i]["source"]+"", G_json["edges"][i]["target"]+""];
    if(Object.keys(adj).indexOf(edge[0])==-1)adj[edge[0]] = {};
    if(Object.keys(adj).indexOf(edge[1])==-1)adj[edge[1]] = {};
    adj[edge[0]][Object.keys(adj[edge[0]]).length+""] = parseInt(edge[1]);
    adj[edge[1]][Object.keys(adj[edge[1]]).length+""] = parseInt(edge[0]);
    if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }

  //node_list.push(all_edges[0].source_label);
  //all_edges.reverse();
  //window.all_edges = all_edges;
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  var nodes = generate_coordinates(all_nodes, n_top, G_json.node_id_to_txt);

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  all_edges.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })


  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node");

  node.append("circle")
   .style("fill", "red")
   .attr("r", 5);

  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    //.text(function(d) { return d.label });
    .text(function(d) { return d.txt });

  d3.select("svg").selectAll("line.link")
   //.data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   //.data(all_edges, d => `${d.source_label}-${d.target_label}`) .enter()
   .data(all_edges) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

   d3.selectAll(".node")
     .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);

  var bottom_order = [];
  var bottom_degree = [];
  var adj2 = JSON.parse(JSON.stringify(adj));
  crossing_removal_k_split(0, n_top, adj, bottom_order, bottom_degree, false);
  console.log("bottom_order", bottom_order);
  console.log("bottom_degree", JSON.parse(JSON.stringify(bottom_degree)));
  adj = adj2;
  var split_txt = n_top+"\n";
  var total_split_edges = 0;
  for(var i=0;i<bottom_degree.length;i++)
  {
    total_split_edges += bottom_degree[i];
  }
  var top_degree = [];
  for(var i=0;i<n_top;i++)
  {
    top_degree.push(Object.values(adj[i+""]).length);
  }
  var cur_top_i = 0;
  var cur_bot_i = 0;
  var bottom_counter = {};
  var id_to_label = {};
  var bot_id = n_top;
  var u = bottom_order[cur_bot_i];
  bottom_counter[u] = 1;
  id_to_label[bot_id] = G_json.node_id_to_txt[u] + ":" + bottom_counter[u];
  for(var i=0;i<total_split_edges;i++)
  {
    split_txt += cur_top_i+"--"+bot_id+"\n";
    bottom_degree[cur_bot_i] -= 1;
    top_degree[cur_top_i] -= 1;
    if(i!=(total_split_edges-1))
    {
      if(bottom_degree[cur_bot_i]==0)
      {
        cur_bot_i+=1;
        bot_id += 1;
        u = bottom_order[cur_bot_i];
        if(Object.keys(bottom_counter).indexOf(u+"")==-1)bottom_counter[u] = 1;
        else bottom_counter[u] += 1;
        id_to_label[bot_id] = G_json.node_id_to_txt[u] + ":" + bottom_counter[u];
      }
      if(top_degree[cur_top_i]==0)cur_top_i+=1;
    }
    console.log("split_txt", JSON.stringify(split_txt));
  }
  for(var i=0;i<n_top;i++)
  {
    id_to_label[i] = G_json.node_id_to_txt[i];
  }
  window.split_txt = split_txt;
  window.id_to_label = id_to_label;

}

function split()
{
  d3.select("svg").selectAll("*").remove();
  var txt = window.split_txt;
  var lines = txt.split('\n');
  var all_edges = [];
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
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  /*
  var nodes = [];
  var top_x = 300;
  var bot_x = 300;
  for(var i=0;i<all_nodes.length;i++)
  {
    if(parseInt(all_nodes[i])<n_top)
    {
      nodes.push({"label":all_nodes[i], "txt":window.id_to_label[all_nodes[i]], "x":top_x, "y":100});
      top_x += 200;
    }
    else
    {
      //nodes.push({"label":all_nodes[i], "x":bot_x, "y":300});
      nodes.push({"label":all_nodes[i], "txt":window.id_to_label[all_nodes[i]], "x":bot_x, "y":300});
      bot_x += 200;
    }
  }
  var max_x = Math.max(top_x, bot_x);
  d3.select("svg").style("width", (max_x+100)+"px");
  */
  var nodes = generate_coordinates(all_nodes, n_top, window.id_to_label);

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  all_edges.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node");

  node.append("circle")
   .style("fill", "red")
   .attr("r", 5);

  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.txt });

  d3.select("svg").selectAll("line.link")
   //.data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   //.data(all_edges, d => `${d.source_label}-${d.target_label}`) .enter()
   .data(all_edges) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

   d3.selectAll(".node")
     .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);

}
