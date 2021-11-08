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
