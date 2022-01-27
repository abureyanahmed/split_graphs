/**
*
* Function that returns the layers of a graph
*
*/

var maxId = 0;
function getNewId() {
	return maxId++;
}

function readGraphML(graph) {

	var nodes = graph.nodes;
	var nodeMap = new Map();
	var edges = graph.links;
	
	
	var maxLayer = d3.max(nodes, d => d.layer);
	
	var layers = []
	
	for(var i = 0; i <= maxLayer; i++) {
		layers.push([]);		
	}
	

	nodes.forEach(n => {
		layers[n['layer']].push(n);
		nodeMap[n['id']] = n;
		n.neighbours = [];
		n.nAbove = [];
		n.nBelow = [];
		n.label = n['id'];
		maxId = Math.max(maxId, n['id']);
	});
	
	edges.forEach(e => {
		var src = nodeMap[e.source];
		var tgt = nodeMap[e.target];
		
		// if (src === undefined)
		// 	src = nodeMap[e['source']]
		// if (tgt === undefined)
		// 	tgt = nodeMap[e['target']]

		e.source = src;
		e.target = tgt;

		// console.log(nodeMap)
		// console.log(e['target'], e);

		src.neighbours.push(tgt);
		tgt.neighbours.push(src);

		if (src.layer > tgt.layer) {
			src.nBelow.push(tgt);
			tgt.nAbove.push(src);
		} else {
			src.nAbove.push(tgt);
			tgt.nBelow.push(src);
		}
	});
	
	return {'nodes': nodes, 'edges': edges, 'layers': layers}
}

function redoEdges(graph) {
	edges = [];
	for(var i = 0; i < graph.layers.length; i++) {
		graph.layers[i].forEach(n => {
			n.nAbove.forEach(nB => {
				var e = {};
				e.source = n;
				e.target = nB;
				edges.push(e);
			});
		});
	}

	graph.edges = edges;
}


function process_hubmap_data(G_json)
{
  var nodes = G_json["nodes"];
  var edges = G_json["edges"];

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

  data_cleanup(nodes_layer3, nodes_layer4, edges);
  //console.log(edges);

  ///*
  split_top = true;
  
  var top_layer = null;
  var bot_layer = null;
  var res = null;

  if(split_top)
  {
    top_layer = nodes_layer3;
    bot_layer = nodes_layer4;
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

  var simple_jsn = {"n_top":res["n_top"], "n_total":res["n"]};
  simple_jsn["edges"] = [];
  simple_jsn["node_id_to_txt"] = {};
  var org_to_consecutive = res["map1"];
  var consecutive_to_org = res["map2"];

  var n_vertices = res["n"];
  for(var i=0;i<edges.length;i++)
  {
    var edge = edges[i];
    var is_edge = false;

    if(check_edge(nodes_layer3, nodes_layer4, edge))
    {
      is_edge = true;
    }
    if(is_edge)
    {
      var s_id = org_to_consecutive[edge.source];
      var t_id = org_to_consecutive[edge.target];
      simple_jsn["edges"].push({"source":edge.source, "target":edge.target});
    }
  }

  for(let i of Object.keys(node_map))
  {
    if(nodes_layer3.has(parseInt(i))||nodes_layer4.has(parseInt(i)))
      simple_jsn["node_id_to_txt"][org_to_consecutive[parseInt(i)]] = node_map[i].name;
  }

  var nodes_total = [];
  nodes_layer3.forEach(i => {
	node_map[i]['layer'] = 1;
	//node_map[i]['id'] = org_to_consecutive[parseInt(i)];
	nodes_total.push(node_map[i])
  });

  nodes_layer4.forEach(i => {
	node_map[i].layer = 0;
	nodes_total.push(node_map[i])
  });

  //nodes_total.push(...Array.from(nodes_layer4));
  console.log(nodes_total)
  return {'links': simple_jsn["edges"], 'nodes': nodes_total};
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