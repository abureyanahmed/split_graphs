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

function naiveNumberCrossings(layers) {
  var crossings = [] 

  for (var i = 1; i < layers.length; i++) {
    layer_0 = layers[i -1];
    layer_1 = layers[i];

    var edges = [];

    layer_1.forEach(node => {
      node.nBelow.forEach(nB => {
        var edge = {};
        edge['upper'] = node['x'];
        edge['lower'] = nB['x'];
        edge['u'] = node;
        edge['v'] = nB;
        edges.push(edge);
      });
    });

    var crossing = 0;
    for( var j = 0; j < edges.length; j++) {
      for (var k = j + 1; k < edges.length; k++) {
        e1 = edges[j];
        e2 = edges[k];

        if (e1['u'] == e2['u'] || e1['v'] == e2['v'])
          continue;

        if (e1['upper'] < e2['upper'] && e1['lower'] > e2['lower'])
          crossing += 1
        else if (e1['upper'] > e2['upper'] && e1['lower'] < e2['lower'])
          crossing += 1
      
      }
    }

    crossings.push(crossing)
  }

  return crossings
}

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
                edge['top'] = node['x'];
                edge['bottom'] = nB['x'];
                edge['id'] = i++;
                edges.push(edge);

                max = Math.max(edge['bottom'], Math.max(edge['top'], max));
            });
        });

        edges.sort((a, b) => a['top'] - b['top'] || a['bottom'] - b['bottom']);
        
        //console.log(edges)
        var crossing = 0;
        var biTree = new BinaryIndexedTree({defaultFrequency: 0, maxVal: max + 2});

        for(var i = 0; i < edges.length; i++) {
            var e1 = edges[i];
            // console.log(e1)
            
            //var val3 = biTree.readSingle(2);
            
            //console.log(i, lower, i - lower);
            biTree.update(e1['bottom'], 1);
            var lower = biTree.read(e1['bottom'] + 1);
            var upper = biTree.read(max + 1);
            // console.log(val1, val2, val3 - val4)
            crossing += upper - lower;
        }

        crossings.push(crossing);
    }

    return crossings
}

function k_CR_maxSpanNodeCount(graph, L, K) {

  layer_1 = graph.layers[L];
  layer_0 = graph.layers[L - 1];

  posByOrder(layer_1);

  layer_0.forEach(node => {
    var barySum = 0;
 
    node.nAbove.forEach(nB => {
          barySum += nB['x'];
      });

    node['barySum'] = barySum;
    node['x'] = barySum / node.nAbove.length;
  });
  var maxSpan = 0;
  var maxNode = 0;

  for(var k = 0; k < K; k++) {
    
    layer_0.forEach(node => {
      var min = 100000;
      var max = -100000;
      
      node.nAbove.forEach(nB => { 
        var x = nB['x'];

        min = Math.min(min, x);
        max = Math.max(max, x);
      });

      var span = max - min;
      // console.log(node['id'], span, min, max)
      node['span'] = span;

      if (span > maxSpan) {
        maxSpan = span;
        maxNode = node;
      }
    });

    if(maxSpan == 0) {
      console.log('no more nodes to split');
      return;
    }

    maxNode.nAbove.sort((a, b) => a['x'] - b['x'])

    var l = maxNode.nAbove.length;
    var min = maxNode.nAbove[0]['x'];
    var max = maxNode.nAbove[l - 1]['x'];

    var sqSpan = 10000000;
    var bestIndex = 1;

    for(var i = 1; i < l; i++) {
      var val = maxNode.nAbove[i]['x'] - maxNode.nAbove[i - 1]['x']
      console.log(val)

      if(sqSpan < val) {
        sqSpan = val;
        bestIndex = i;
      }
    }

    left = Object.assign({}, maxNode);
    right = Object.assign({}, maxNode);

    left.id = getNewId();
    right.id = getNewId();
    
    left.nAbove = [];
    left.nBelow = [];
    right.nAbove = [];
    right.nBelow = [];

    var rightP = 0;
    var leftP = 0;

    maxNode.nAbove.forEach((n, i) => {
        if(i < bestIndex) {
          left.nAbove.push(n);
          n.nBelow = arrayRemove(n.nBelow, maxNode);
          n.nBelow.push(left)
          leftP += n.x;
        } else {
          right.nAbove.push(n);
          n.nBelow = arrayRemove(n.nBelow, maxNode);
          n.nBelow.push(right);
          rightP += n.x;
        }
    });

    left.x = leftP / left.nAbove.length;
    right.x = rightP / right.nAbove.length;
    // console.log(sqSpan, bestIndex)
    // console.log(left)
    // console.log(right)
    // console.log(maxNode);

    graph.nodes = arrayRemove(graph.nodes, maxNode);
    graph.nodes.push(left);
    graph.nodes.push(right);


    layer_0 = arrayRemove(layer_0, maxNode);
    layer_0.push(left);
    layer_0.push(right);
  }

  layer_0.sort((a,b) => a['x'] - b['x']);

  graph.layers[L] = layer_1;
  graph.layers[L - 1] = layer_0;
  redoEdges(graph);
  console.log(layer_0,graph)

  return graph
}

function k_CR_maxSpan(graph, L, K) {

  layer_1 = graph.layers[L];
  layer_0 = graph.layers[L - 1];

  posByOrder(layer_1);

  layer_0.forEach(node => {
    var barySum = 0;
 
    node.nAbove.forEach(nB => {
          barySum += nB['x'];
      });

    node['barySum'] = barySum;
    node['x'] = barySum / node.nAbove.length;
  });


  var maxSpan = 0;
  var maxNode = undefined;

  for(var k = 0; k < K; k++) {
    
    layer_0.forEach(node => {
      var min = 100000;
      var max = -100000;
      
      node.nAbove.forEach(nB => { 
        var x = nB['x'];

        min = Math.min(min, x);
        max = Math.max(max, x);
      });

      var span = max - min;
      // console.log(node['id'], span, min, max)
      node['span'] = span;

      if (span > maxSpan) {
        maxSpan = span;
        maxNode = node;
      }
    });

    if (maxNode == undefined) {
      break;
    }

    maxNode.nAbove.sort((a, b) => a['x'] - b['x'])

    var l = maxNode.nAbove.length;
    var min = maxNode.nAbove[0]['x'];
    var max = maxNode.nAbove[l - 1]['x'];

    var sqSpan = 10000000;
    var bestIndex = 0;

    for(var i = 1; i < l; i++) {
      var span1 = maxNode.nAbove[i - 1]['x'] - min;
      var span2 = max - maxNode.nAbove[i]['x'];

      // console.log(i, span1, span2);
      var val = span1 * span1 + span2 * span2

      if(sqSpan > val) {
        sqSpan = val;
        bestIndex = i;
      }
    }

    left = Object.assign({}, maxNode);
    right = Object.assign({}, maxNode);

    left.id = getNewId();
    right.id = getNewId();
    
    left.nAbove = [];
    left.nBelow = [];
    right.nAbove = [];
    right.nBelow = [];

    var rightP = 0;
    var leftP = 0;

    maxNode.nAbove.forEach((n, i) => {
        if(i < bestIndex) {
          left.nAbove.push(n);
          n.nBelow = arrayRemove(n.nBelow, maxNode);
          n.nBelow.push(left)
          leftP += n.x;
        } else {
          right.nAbove.push(n);
          n.nBelow = arrayRemove(n.nBelow, maxNode);
          n.nBelow.push(right);
          rightP += n.x;
        }
    });

    left.x = leftP / left.nAbove.length;
    right.x = rightP / right.nAbove.length;

    maxNode.nBelow.forEach(n => {
      left.nBelow.push(n);
      right.nBelow.push(n);
    });

    // console.log(sqSpan, bestIndex)
    // console.log(left)
    // console.log(right)
    // console.log(maxNode);

    graph.nodes = arrayRemove(graph.nodes, maxNode);
    graph.nodes.push(left);
    graph.nodes.push(right);


    layer_0 = arrayRemove(layer_0, maxNode);
    layer_0.push(left);
    layer_0.push(right);
  }


  layer_0.sort((a,b) => a['x'] - b['x']);


  graph.layers[L] = layer_1;
  graph.layers[L - 1] = layer_0;
  redoEdges(graph);
  //console.log(layer_0,graph)

  return graph
}

function k_CR_maxCross(graph, L, K) {

  layer_1 = graph.layers[L];
  layer_0 = graph.layers[L - 1];

  posByOrder(layer_1);
  //posByNeighboursAbove(layer_0);

  layer_0.forEach(node => {
    var barySum = 0;
    node.nAbove.sort((a,b) => a['x'] - b['x']);
 
    node.nAbove.forEach(nB => {
          barySum += nB['x'];
      });

    node['barySum'] = barySum;
    node['x'] = barySum / node.nAbove.length;
  });

  for(var k = 0; k < K; k++) {   

    layer_0.sort((a, b) => a['x'] - b['x']);

    var crossingAvoidsBest = 0;
    var maxNode = undefined;
    var bestIndex;
    var baryLeft;
    var baryRight;

    layer_0.forEach((node, ind) => {
          var leftBarySum = 0;
          var rightBarySum = node['barySum'];
          //console.log('next', node['label']);

          if(node.nAbove.length <= 1){
            return;
          }

          for(var i = 0; i < node.nAbove.length - 1; i++) {
            var nb = node.nAbove[i];

            leftBarySum += nb['x'];
            rightBarySum -= nb['x'];
            
            var crossingAvoid = 0;
            
            var nLeft = i + 1;
            var nRight = node.nAbove.length - nLeft; 
            
            var leftBary = leftBarySum / nLeft;
            var rightBary = rightBarySum / nRight;

            //console.log(node['x'], nb['x'], nLeft, nRight, leftBary / nLeft, rightBary / nRight)
            //console.log(nLeft, nRight);

            var leftEnd = node.nAbove[0]['x'];
            var leftBegin = nb['x'];
            var rightBegin = node.nAbove[i + 1]['x'];
            var rightEnd = node.nAbove[node.nAbove.length - 1]['x'];
            
            var curInd = ind + 1;
            var next = layer_0[curInd];
            
            //console.log(rightBegin);
            //console.log(rightEnd);

            while(curInd < layer_0.length && next['x'] < rightBary) {
              //console.log('checking ', next['id']);

              next.nAbove.forEach(nextNb => {
                  var x = nextNb['x'];

                  if (x < rightBegin) {
                    crossingAvoid += nRight;
                    //console.log('avoiding all right crossings', nRight, x, nextNb['id']);
                  } else if (x <= rightEnd) {
                    //console.log('checking ', x)
                    var l = 0;
                    var r = 0;
                    for(var crossing = 0; crossing < nRight; crossing++) {
                      //console.log('against', node.nAbove[nLeft + crossing]['x'])
                      if(x < node.nAbove[nLeft + crossing]['x']) {
                        l += 1;
                        // console.log('failed check', crossing)
                        // break;
                      } else if (x > node.nAbove[nLeft + crossing]['x']) {
                        r += 1;
                      }
                    }
                    //console.log(crossing)
                    //crossingAvoid += nRight - 2 * (crossing + 1);
                    crossingAvoid += r - l;
                    //console.log('avoiding some right crossings', r - l);
                  } else {
                    //console.log('above right end', x, nextNb['id'])
                  }
              });

              next = layer_0[++curInd];
            }

            var curInd = ind - 1;
            next = layer_0[curInd];

            //console.log(leftBegin);
            //console.log(leftEnd);

            while(curInd >= 0 && next['x'] > leftBary) {
              //console.log('checking ', next['id']);

              for(var j = next.nAbove.length -1; j >= 0; j--) {
                  var nextNb = next.nAbove[j];
                  var x = nextNb['x'];
                  var l = 0;
                  var r = 0;
                  if (x > leftBegin) {
                    crossingAvoid += nLeft;
                    //console.log('avoiding all left crossings', nLeft, x, nextNb['id']);
                  } else if (x >= leftEnd) {
                    //console.log('checking ', x, nextNb['id'])
                    for(var crossing = 0; crossing < nLeft; crossing++) {
                      //console.log('against', node.nAbove[nLeft - crossing - 1]['x'])
                      if(x > node.nAbove[nLeft - crossing - 1]['x']) {
                        r += 1;
                        // console.log('failed check', crossing)
                        // break;
                      } else if (x < node.nAbove[nLeft - crossing - 1]['x']) {
                        l += 1;
                      }
                      // if(x > node.nAbove[nLeft - crossing - 1]['x']) {
                      //   console.log('failed check', crossing)
                      //   break;
                      // }
                    } 

                    crossingAvoid += l - r;
                    //console.log('avoiding some left crossings', l-r);
                  } else {
                    //console.log('above right end', x, nextNb['id'])
                  }
              }

              next = layer_0[--curInd];
            }

            if(crossingAvoid > crossingAvoidsBest) {
              bestIndex = i;
              maxNode = node;
              crossingAvoidsBest = crossingAvoid;
              baryLeft = leftBary;
              baryRight = rightBary;
              // console.log(node, i, crossingAvoid)
            }

          }
    });

    if (maxNode === undefined) {
      console.log('no more crossings. No split possible');
      break;
    }

    //console.log(maxNode.label, crossingAvoidsBest)

    left = Object.assign({}, maxNode);
    right = Object.assign({}, maxNode);

    left.id = getNewId();
    right.id = getNewId();
    
    left.nAbove = [];
    left.nBelow = [];
    right.nAbove = [];
    right.nBelow = [];

    left['x'] = baryLeft;
    right['x'] = baryRight;

    maxNode.nAbove.forEach((n, i) => {
        if(i <= bestIndex) {
          left.nAbove.push(n);
          n.nBelow = arrayRemove(n.nBelow, maxNode);
          n.nBelow.push(left)
        } else {
          right.nAbove.push(n);
          n.nBelow = arrayRemove(n.nBelow, maxNode);
          n.nBelow.push(right);
        }
    });

    maxNode.nBelow.forEach(n => {
      left.nBelow.push(n);
      right.nBelow.push(n);
    });

    left.barySum = baryLeft * left.nAbove.length;
    right.barySum = baryRight * right.nAbove.length;

    // console.log(sqSpan, bestIndex)
    //console.log(left)
    //console.log(right)
    // console.log(maxNode);

    graph.nodes = arrayRemove(graph.nodes, maxNode);
    graph.nodes.push(left);
    graph.nodes.push(right);


    layer_0 = arrayRemove(layer_0, maxNode);
    layer_0.push(left);
    layer_0.unshift(right);
  }

  //console.log(layer_0)
  layer_0.sort((a, b) => a['x'] - b['x']);

  //console.log(layer_0)
  graph.layers[L] = layer_1;
  graph.layers[L - 1] = layer_0;
  redoEdges(graph);
  //console.log(layer_0,graph)

  return graph;

}


function arrayRemove(arr, value) { 
    
  return arr.filter(function(ele){
      return ele != value; 
  });
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
