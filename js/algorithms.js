/**
 * Pass a list (layer) of nodes and all nodes are assigned a coordinate of their position according to their index
 * 
 * @param {[object]} nodes 
 */
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
                console.log('break')
                break
            } else {
                index++;
            }
        }
    });    
}

function posByNeighboursBelow(nodes) {
    nodes.forEach(node => {
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

/**
 * Perform barycenter crossing minimization.
 * 
 * @param {*} layers 
 * @param {int} iterations
 */
function barycenter(layers, iterations) {
    // console.log(layers);
    // posByOrder(layers[0]);

    for(var i = 0; i < iterations; i++) {
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

/** calculate the number of crossings for each layer pair and return a list of crossings (in layer order).
 * 
 */

function numberCrossings(layers) {

    var crossings = [] 
    for (var i = 1; i < layers.length; i++) {
        layer_0 = layers[i -1];
        layer_1 = layers[i];

        var edges = []

        var max = 0;
        var i = 0;
        layer_1.forEach(node => {
            node.nBelow.forEach(nB => {
                var edge = {};
                edge['left'] = Math.min(node['x'], nB['x']);
                edge['right'] = Math.max(node['x'], nB['x']);
                edge['id'] = i++;
                edges.push(edge);

                max = Math.max(edge['right'], max);
            });
        });

        edges.sort((a, b) => a['left'] - b['left'] || a['right'] - b['right']);
        
        console.log(edges)
        var crossing = 0;
        // for(var i = 0; i < edges.length; i++) {
        //     var e1 = edges[i];
        //     for(var j = i + 1; j < edges.length; j++) {
        //         var e2 = edges[j];
        //         if (e1['left'] == e2['left'])
        //             continue;

        //         if (e1['right'] <= e2['right']){
        //             break;
        //         }
        //         else{
        //             console.log(e1.right, e2.right, e1['right'] >= e2['right'])
        //             crossing++;
        //         }
        //     }
        // }

        var biTree = new BinaryIndexedTree({defaultFrequency: 0, maxVal: edges.length});

        for(var i = 0; i < edges.length; i++) {
            var e1 = edges[i];
            
            var val3 = biTree.readSingle(2);
            
            console.log(i, lower, i - lower);

            biTree.writeSingle(i, 1);
            crossing += i - lower
        }

        crossings.push(crossing);
    }

    return crossings
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