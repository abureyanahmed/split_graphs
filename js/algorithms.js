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
    console.log(layers);
    posByOrder(layers[0]);

    for(var i = 0; i < iterations; i++) {

        for(var x = 1; x < layers.length; x++) {
            posByNeighboursBelow(layers[x]);
        }

        for(var x = layers.length - 1; x >= 0; x--) {
            posByNeighboursAbove(layers[x]);
        }
    }

    console.log(layers);

    for(var i = 0; i < layers.length; i++) {
        layers[i].sort((a, b) => a['x'] - b['x']);
        posByOrder(layers[i]);
    }

    console.log(layers);
}
