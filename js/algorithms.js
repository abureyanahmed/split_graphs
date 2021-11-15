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

        var i = 0;
        layer_1.forEach(node => {
            node.nBelow.forEach(nB => {
                var edge = {};
                edge['left'] = Math.min(node['x'], nB['x']);
                edge['right'] = Math.max(node['x'], nB['x']);
                edge['id'] = i++;
                edges.push(edge);
            })
        });

        edges.sort((a, b) => a['left'] - b['left'] || a['right'] - b['right']);
        
        var crossing = 0;
        for(var i = 0; i < edges.length; i++) {
            var e1 = edges[i];
            for(var j = i + 1; j < edges.length; j++) {
                var e2 = edges[j];
                if (e1['left'] == e2['left'])
                    continue;

                if (e1['right'] >= e2['right']){
                    break;
                }
                else{
                    crossing++;
                }
            }
        }

        crossings.push(crossing);
    }

    return crossings
}