
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
  //console.log("bot degree start", JSON.stringify(bottom_degree), "top_start", top_start, "n_top", n_top, "adj", JSON.stringify(adj), "reuse_last_bot", reuse_last_bot);
  var V = Object.keys(adj);

  // If there is a common neighbor with previous node, add the edge with common neighbor
  if(reuse_last_bot)
  {
    bottom_degree[bottom_degree.length-1] += 1;
    var u = top_start+"";
    var N_u = Object.values(adj[u]);
    var bot_ngbr = bottom_order[bottom_order.length-1];
    var N_w_dict = adj[bot_ngbr+""];
    //console.log("N_w_dict before", JSON.stringify(N_w_dict));
    delete_val(N_w_dict, parseInt(u));
    //console.log("N_w_dict after", JSON.stringify(N_w_dict));
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
    N_u = Object.values(adj[u]);
    if(N_u.length==1)
    {
      delete adj[u];
      crossing_removal_k_split(top_start+1, n_top, adj, bottom_order, bottom_degree, reuse_last_bot);
      return;
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
  var N_u = [];
  if(Object.keys(adj).indexOf(u)!=-1)
    N_u = Object.values(adj[u]);
  var N_v = [];
  if(Object.keys(adj).indexOf(v)!=-1)
    N_v = Object.values(adj[v]);
  var common_neighbors = [];
  for(var i=0;i<N_u.length;i++)
  {
    if(N_v.indexOf(N_u[i])!=-1)
    {
      common_neighbors.push(N_u[i]);
    }
  }
  //console.log("common_neighbors", common_neighbors);
  var first_common = -1;
  reuse_last_bot = false;
  if(common_neighbors.length>0)
  {
    first_common = common_neighbors[0];
    reuse_last_bot = true;
  }
  for(var i=0;i<N_u.length;i++)
  {
    //console.log("top:", u);
    //console.log("bot:", N_u[i]);
    //console.log("adj:", adj[N_u[i]+""]);
    // getting N_u[i] equal to Nan, fix it
    //if(isNaN(N_u[i]))continue;

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
  //console.log("bot degree end", JSON.stringify(bottom_degree));
}
function get_next_layer(cur_layer, edges, nodes)
{
  var next_layer = new Set();
  //var next_layer_type = new Set();
  //var cnt = 0;
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    if(cur_layer.has(edge.source))
    {
      //if(cnt==150)break;
      next_layer.add(edge.target);
      //next_layer_type.add(nodes[edge.target].type);
      //cnt += 1;
    }
  }
  return next_layer;
}
function get_sorted_ids(source_ids, node_map)
{
  var sorted_top = [];
  for(let k of Object.keys(node_map))
  {
    if(source_ids.has(parseInt(k)))
      sorted_top.push(node_map[k]);
  }
  //console.log("before sorting:", JSON.parse(JSON.stringify(sorted_top)));
  sorted_top.sort((a, b) => a.name.localeCompare(b.name));
  //console.log("after sorting:", JSON.parse(JSON.stringify(sorted_top)));
  var sorted_top_id = [];
  for(var i=0;i<sorted_top.length;i++)
    sorted_top_id.push(sorted_top[i].id);
  return sorted_top_id;
}
function posByOrder(nodes) {
    nodes.forEach((node, index) => {
        node['x'] = index;
    });
}
function posByIndex(nodes) {
    var index = 0;
    nodes.forEach((node) => {

        while(true) {
            if (index >= node['x']) {
                node['x'] = index;
                index++;
                //console.log('break')
                break
            } else {
                index++;
            }
        }
    });    
}
function posByNeighboursBelow(nodes) {
    nodes.forEach(node => {
        //console.log("node:", node);
        if (node.nBelow.length <= 0)
            node['x'] = 0;
        else
            node['x'] = d3.mean(node.nBelow, d => d['x']);
    });
}
function posByNeighboursAbove(nodes) {
    nodes.forEach(node => {
        if (node.nAbove.length <= 0)
            node['x'] = 0;
        else
            node['x'] = d3.mean(node.nAbove, d => d['x']);
    });
}
function barycenter(layers, iterations) {
    //console.log(layers);
    // posByOrder(layers[0]);

    for(var i = 0; i < iterations; i++) {
        //console.log("iteration:", i);
        layers[0].sort((a, b) => a['x'] - b['x']);
        posByOrder(layers[0]);

        for(var x = 1; x < layers.length; x++) {
            posByNeighboursBelow(layers[x]);
        }

        for(var x = layers.length - 2; x >= 0; x--) {
            posByNeighboursAbove(layers[x]);
        }
    }
    //console.log(layers);
    
    layers[0].sort((a, b) => a['x'] - b['x']);
    posByOrder(layers[0]);

    for(var i = 1; i < layers.length; i++) {
        layers[i].sort((a, b) => a['x'] - b['x']);
        posByIndex(layers[i])
    }

    // console.log(layers);
}
function generate_barycenter_layers(source_ids, target_ids, edge_arr)
{
  /*
  var source_ids = new Set();
  source_ids.add(0);
  source_ids.add(1);
  var target_ids = new Set();
  target_ids.add(2);
  target_ids.add(3);
  target_ids.add(4);
  target_ids.add(5);
  target_ids.add(6);
  var edge_arr = [{source:0, target:2}, {source:0, target:3}, {source:0, target:4}, {source:0, target:5}, {source:0, target:6}, {source:1, target:2}, {source:1, target:3}, {source:1, target:4}, {source:1, target:5}, {source:1, target:6}];
  */

  var id_to_node = {};
  var node_arr = [];
  var node = null;
  var layer1 = [];
  var layer2 = [];

  for(var i=0;i<edge_arr.length;i++)
  {
    var edge = edge_arr[i];
    if(check_edge(source_ids, target_ids, edge))
    {
      var ids = Object.keys(id_to_node);
      var s = edge.source;
      if(ids.indexOf(s+"")==-1)
      {
        var newNode = {id:s, nAbove:[], nBelow:[]};
        id_to_node[s] = newNode;
        layer1.push(newNode);
      }
      var t = edge.target;
      if(ids.indexOf(t+"")==-1)
      {
        var newNode = {id:t, nAbove:[], nBelow:[]};
        id_to_node[t] = newNode;
        layer2.push(newNode);
      }
      id_to_node[s].nBelow.push(id_to_node[t]);
      id_to_node[t].nAbove.push(id_to_node[s]);
    }
  }
  var layers = [layer1, layer2];

  /*
  node = {id:0, txt:"Bone marrow"};
  node_arr.push(node);
  node = {id:1, txt:"Blood"};
  node_arr.push(node);
  node = {id:2, txt:"basophil"};
  node_arr.push(node);
  node = {id:3, txt:"CD14 monocyte"};
  node_arr.push(node);
  node = {id:4, txt:"CD16 monocyte"};
  node_arr.push(node);
  node = {id:5, txt:"CD4 naAfA-ve"};
  node_arr.push(node);
  node = {id:6, txt:"CD4 T cell effector memory CD45RA"};
  node_arr.push(node);

  node_arr[0].nBelow = [node_arr[2], node_arr[3], node_arr[4], node_arr[5], node_arr[6]]
  node_arr[0].nAbove = [];
  node_arr[1].nBelow = [node_arr[2], node_arr[3], node_arr[4], node_arr[5], node_arr[6]]
  node_arr[1].nAbove = [];
  node_arr[2].nAbove = [node_arr[0], node_arr[1]];
  node_arr[2].nBelow = [];
  node_arr[3].nAbove = [node_arr[0], node_arr[1]];
  node_arr[3].nBelow = [];
  node_arr[4].nAbove = [node_arr[0], node_arr[1]];
  node_arr[4].nBelow = [];
  node_arr[5].nAbove = [node_arr[0], node_arr[1]];
  node_arr[5].nBelow = [];
  node_arr[6].nAbove = [node_arr[0], node_arr[1]];
  node_arr[6].nBelow = [];

  var layer1 = [node_arr[0], node_arr[1]];
  var layer2 = [node_arr[2], node_arr[3], node_arr[4], node_arr[5], node_arr[6]]
  var layers = [layer1, layer2];
  */

  barycenter(layers, 10);

  //console.log(layers);

  layer1.sort((a, b) => a.x<b.x);
  var sorted_top_id = [];
  for(var i=0;i<layer1.length;i++)
    sorted_top_id.push(layer1[i].id);
  layer2.sort((a, b) => a.x<b.x);
  var sorted_bot_id = [];
  for(var i=0;i<layer2.length;i++)
    sorted_bot_id.push(layer2[i].id);
  return [sorted_top_id, sorted_bot_id];
}
function transfer_id(source_ids, target_ids, edges, node_map)
{
  var org_to_consecutive = {};
  var consecutive_to_org = {};
  var n_top = 0;
  //for(let v of source_ids)
  var sorted_top_id = null;
  var sorted_bot_id = null;
  var alphabetical_order = null;
  if(document.getElementById("alphabetical_order").checked){
    alphabetical_order = true;
  }
  else{
    alphabetical_order = false;
  }
  if(alphabetical_order)
    sorted_top_id = get_sorted_ids(source_ids, node_map);
  else
  {
    var res = generate_barycenter_layers(source_ids, target_ids, edges);
    sorted_top_id = res[0];
    sorted_bot_id = res[1];
  }
  for(var i=0;i<sorted_top_id.length;i++)
  {
    var v = sorted_top_id[i];
    org_to_consecutive[v] = n_top;
    consecutive_to_org[n_top] = v;
    n_top++;
  }
  //console.log("org_to_consecutive", org_to_consecutive);
  var i = n_top;
  if(alphabetical_order)
    sorted_bot_id = get_sorted_ids(target_ids, node_map);
  //for(let v of target_ids)
  for(var j=0;j<sorted_bot_id.length;j++)
  {
    var v = sorted_bot_id[j];
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
function data_cleanup(source_ids, target_ids, edges)
{
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
        //console.log("Removing duplicate", cur_str);
        break;
      }
      edge_set.add(edge.source+","+edge.target);
    }
  }
  for(let v of target_ids)
  {
    if(source_ids.has(v))
    {
      target_ids.delete(v);
      continue;
    }
  }
  var del_mark = [];
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    if(!(source_ids.has(edge.source) && target_ids.has(edge.target)))del_mark.push(true);
    else del_mark.push(false);
  }
  var del_count = 0;
  var size = edges.length;
  for(var i=0;i<size;i++)
  {
    if(del_mark[i]==true)
    {
      edges.splice(i-del_count, 1);
      del_count += 1;
    }
  }
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
  for(let v of source_ids)
  {
    if(source_degree[v]==0)
      source_ids.delete(v);
  }
  for(let v of target_ids)
  { 
    if(target_degree[v]==0)
      target_ids.delete(v);
  }
}
function check_edge(nodes_layer3, nodes_layer4, edge)
{
  if(nodes_layer3.has(edge.source)&&nodes_layer4.has(edge.target))
    return true;
  return false;
}
function process_hubmap_data()
{
  var txt = document.getElementById("input_text").value;
  var G_json = JSON.parse(txt);
  var nodes = G_json["nodes"];
  var edges = G_json["edges"];
  /*
  var root_layer = new Set();
  root_layer.add(0);
  */

  /*
  var nodes_layer2 = get_next_layer(root_layer, edges, nodes);
  var nodes_layer3 = get_next_layer(nodes_layer2, edges, nodes);
  var nodes_layer4 = get_next_layer(nodes_layer3, edges, nodes);
  */

  /*
  var prev_layer = root_layer;
  var nodes_layer3 = null;
  var nodes_layer4 = null;
  */
  //bone marrow
  //for(var i=0;i<3;i++)
  //brain
  //for(var i=0;i<9;i++)
  //heart
  //for(var i=0;i<5;i++)
  //kidney
  //for(var i=0;i<7;i++)
  //large intestine
  //for(var i=0;i<6;i++)
  //lung
  //for(var i=0;i<10;i++)
  //lymph nodes
  //for(var i=0;i<7;i++)
  //skin
  //for(var i=0;i<5;i++)
  //spleen, thymus
  /*
  for(var i=0;i<7;i++)
  {
    var cur_layer = get_next_layer(prev_layer, edges, nodes);
    nodes_layer3 = prev_layer;
    nodes_layer4 = cur_layer;
    prev_layer = cur_layer;
  }
  */
  var node_map = {};
  var nodes_layer3 = new Set();
  var nodes_layer4 = new Set();
  for(var i=0;i<G_json.nodes.length;i++)
  {
    node_map[G_json.nodes[i].id] = G_json.nodes[i];
  }
  //console.log(node_map);
  //var cnt1 = 0;
  //var cnt2 = 0;
  for(let i of Object.keys(node_map))
  {
    if(node_map[i].type=="CT")
    {
      //if(cnt1==5)continue;
      nodes_layer3.add(node_map[i].id);
      //cnt1++;
    }
    if((node_map[i].type=="gene")||(node_map[i].type=="protein"))
    {
      //if(cnt2==5)continue;
      nodes_layer4.add(node_map[i].id);
      //cnt2++;
    }
  }
  //console.log("nodes_layer3:", nodes_layer3);
  //console.log("Size of layer3:", nodes_layer3.size);
  //console.log("nodes_layer4:", nodes_layer4);
  //console.log("Size of layer4:", nodes_layer4.size);

  /*
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
  */
  data_cleanup(nodes_layer3, nodes_layer4, edges);
  //console.log(edges);

  ///*
  var split_top = null;
  if(document.getElementById("blue_vertices").checked){
    split_top = true;
  }
  else{
    split_top = false;
  }
  var top_layer = null;
  var bot_layer = null;
  var res = null;
  //nodes_layer3 = new Set();
  //for(var i=0;i<8;i++)
  //{
  //  nodes_layer3.add(i+3);
  //  console.log("Degree of "+(i+3), show_degree(i+3, edges));
  //}
  if(split_top)
  {
    top_layer = nodes_layer3;
    bot_layer = nodes_layer4;
    /*
    var set_intersect = new Set();
    for(let item of top_layer)
    {
      if(bot_layer.has(item))
      {
        set_intersect.add(item);
      }
    }
    console.log("Intersection", set_intersect);
    for(let item of top_layer)
    {
      if(bot_layer.has(item))
      {
        bot_layer.delete(item);
      }
    }
    set_intersect = new Set();
    for(let item of top_layer)
    {
      if(bot_layer.has(item))
      { 
        set_intersect.add(item);
      }
    }
    console.log("Intersection", set_intersect);
    */
    //res = transfer_id(top_layer, bot_layer, edges);
  }
  else
  {
    top_layer = nodes_layer4;
    bot_layer = nodes_layer3;
    var tmp = nodes_layer3;
    nodes_layer3 = nodes_layer4;
    nodes_layer4 = tmp;
    for(var i=0;i<edges.length;i++)
    {
      var edge = edges[i];
      var t = edge.source;
      edge.source = edge.target;
      edge.target = t;
    }
  }
  res = transfer_id(top_layer, bot_layer, edges, node_map);
  //console.log("res", res);
  var simple_jsn = {"n_top":res["n_top"], "n_total":res["n"]};
  simple_jsn["edges"] = [];
  simple_jsn["node_id_to_txt"] = {};
  var org_to_consecutive = res["map1"];
  var consecutive_to_org = res["map2"];
  //console.log("org_to_consecutive", org_to_consecutive);
  //console.log("consecutive_to_org", consecutive_to_org);
  var n_vertices = res["n"];
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    var is_edge = false;
    //if(nodes_layer3.has(edge.source)&&nodes_layer4.has(edge.target))
    if(check_edge(nodes_layer3, nodes_layer4, edge))
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
  /*
  for(var i=0;i<n_vertices;i++)
  {
    simple_jsn["node_id_to_txt"][i+""] = nodes[consecutive_to_org[i]].name;
  }
  */
  //console.log("node map:", node_map)
  for(let i of Object.keys(node_map))
  {
    if(nodes_layer3.has(parseInt(i))||nodes_layer4.has(parseInt(i)))
      simple_jsn["node_id_to_txt"][org_to_consecutive[parseInt(i)]] = node_map[i].name;
  }
  //console.log("node_id_to_txt:", simple_jsn["node_id_to_txt"]);
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
  var n_bot = all_nodes.length-n_top;
  var max_nodes = Math.max(n_top, n_bot);
  var height = max_nodes*200;
  var max_node = 0;
  for(var i=0;i<all_nodes.length;i++)
  {
    max_node = Math.max(max_node, parseInt(all_nodes[i]));
  }
  //for(var i=0;i<all_nodes.length;i++)
  for(var i=0;i<=max_node;i++)
  {
    if(all_nodes.indexOf(i+"")==-1)continue;
    //if(parseInt(all_nodes[i])<n_top)
    if(i<n_top)
    {
      //nodes.push({"label":all_nodes[i], "txt":node_id_to_txt[all_nodes[i]], "x":100, "y":left_y});
      nodes.push({"label":i, "txt":node_id_to_txt[i], "x":100, "y":left_y});
      //left_y += 200;
      left_y += height/n_top;
    }
    else
    {
      //nodes.push({"label":all_nodes[i], "txt":node_id_to_txt[all_nodes[i]], "x":600, "y":right_y});
      nodes.push({"label":i, "txt":node_id_to_txt[i], "x":600, "y":right_y});
      //right_y += 200;
      right_y += height/n_bot;
    }
  }
  var max_y = Math.max(left_y, right_y);
  d3.select("svg").style("height", (max_y+100)+"px");
  return nodes;
}
function find_crossings(G_json)
{
  var crss_cnt = 0;
  for(var i=0;i<G_json.edges.length;i++)
  {
    var src1 = G_json.edges[i]["source"];
    var trgt1 = G_json.edges[i]["target"];
    for(var j=i+1;j<G_json.edges.length;j++)
    {
      var src2 = G_json.edges[j]["source"];
      var trgt2 = G_json.edges[j]["target"];
      if((src1>src2)&&(trgt1<trgt2))
        crss_cnt += 1;
      else if((src1<src2)&&(trgt1>trgt2))
        crss_cnt += 1;
    }
  }
 console.log("Total crossings: " + crss_cnt);
}
function split_stats(G_json, bottom_order, bottom_degree)
{
  var n_top = G_json["n_top"];
  var n_bot = G_json["n_total"] - n_top;
  console.log("Original top vertices: " + n_top);
  console.log("Original bottom vertices: " + n_bot);
  var split_counter = {};
  for(var i=0;i<n_bot;i++)
  {
    split_counter[n_top+i] = 0;
  }
  //console.log(typeof bottom_order[0]);
  var vertex_splits = - n_bot;
  for(var i=0;i<bottom_order.length;i++)
  {
    if(bottom_order[i]<n_top)continue;
    vertex_splits += 1;
    split_counter[bottom_order[i]] += 1;
  }
  /*
  var i = 0;
  for (const [key, value] of Object.entries(split_counter)) {
    console.log(key, value);
    i += 1;
    if(i==5)break;
  }
  */
  var split_vertices = 0;
  for (const [key, value] of Object.entries(split_counter)) {
    if(value>1)
      split_vertices += 1;
  }
  var max_split = 0;
  for (const [key, value] of Object.entries(split_counter)) {
    max_split = Math.max(max_split, value-1);
  }
  console.log("Vertex splits: " + vertex_splits);
  console.log("Split verices: " + split_vertices);
  console.log("Maximum split: " + max_split);
}
function draw()
{
  var G_json = process_hubmap_data();
  //console.log("G_json", G_json);
  find_crossings(G_json);
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
    .attr("class", "node")
    .on("click", nodeClick);

  function nodeClick(node)
  {
    //alert("Node clicked");
    //console.log(node);
    if("clicked" in node)node.clicked = !node.clicked;
    else node.clicked = true;
    if(node.clicked)
      d3.selectAll("path").filter(d => d.source==node || d.target==node).style("opacity", 1.0).style("stroke-width", d => 2*d.weight);
    else
      d3.selectAll("path").filter(d => d.source==node || d.target==node).style("opacity", .5).style("stroke-width", d => d.weight);
  }

  node.append("circle")
   .style("fill", "red")
   .attr("r", 5);

  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    //.text(function(d) { return d.label });
    .text(function(d) { return d.txt });

  /*
  d3.select("svg").selectAll("line.link")
   .data(all_edges) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);
  */

  d3.select("svg").selectAll("path")
   .data(all_edges) .enter()
   .append("path")
   .attr("class", "arc")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight)
   .attr("d", arc);

  function arc(d,i) {
    var draw = d3.line().curve(d3.curveBasis)
    //var midX = (d.source.x + d.target.x) / 2
    //var midY = (d.source.y + d.target.x) / 2
    //return draw([[100, d.source.y],[midX,midY],[600, d.target.y]]) 
    return draw([[100, d.source.y], [250, d.source.y], [450, d.target.y], [600, d.target.y]]) 
  }

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
  //console.log("bottom_order", bottom_order);
  //console.log("bottom_degree", JSON.parse(JSON.stringify(bottom_degree)));
  split_stats(G_json, bottom_order, bottom_degree);
  adj = adj2;
  var split_txt = n_top+"\n";
  var total_split_edges = 0;
  for(var i=0;i<bottom_degree.length;i++)
  {
    total_split_edges += bottom_degree[i];
  }
  //console.log("total_split_edges:", total_split_edges);
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
    //console.log("split_txt", JSON.stringify(split_txt));
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
    //console.log(lines[i]);
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

  //console.log("All nodes:", all_nodes);

  var nodes = generate_coordinates(all_nodes, n_top, window.id_to_label);

  //console.log("nodes:", nodes);

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  //console.log("node hash:", nodeHash);

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

  //console.log("All edges:", all_edges);

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
     //.attr("x2", function(d){console.log(d); return d.target.x;})
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);

}
