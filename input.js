/**
*
* Function that returns the layers of a graph
*
*/
function readGraphML(var graph) {

	var nodes = graph.nodes;
	var nodeMap = Map();
	var edges = graph.edges;
	
	
	var maxLayer = d3.max(nodes, d => d.layer);
	
	var layers = []
	
	for(int i = 0; i < maxLayer; i++) {
		layers.push([]);		
	}
	
	
	nodes.forEach(n => {
		layers[n.layer].push(n);
		nodeMap[n.id] = n;
	}
	
	edges.forEach(e => {
	
		var src = nodeMap[e.source];
		var tgt = nodeMap[e.target];
	
	}
	
	return {'nodes': nodes, 'edges': edges, 'layers': layers}
}

function barycenter(graph) {

	var layers = graph.layers
	
	

}
