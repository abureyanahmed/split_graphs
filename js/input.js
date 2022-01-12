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
		layers[n.layer].push(n);
		nodeMap[n.id] = n;
		n.neighbours = [];
		n.nAbove = [];
		n.nBelow = [];
		n.label = n.id;
		maxId = Math.max(maxId, n.id);
	});
	
	edges.forEach(e => {
		var src = nodeMap[e.source];
		var tgt = nodeMap[e.target];

		e.source = src;
		e.target = tgt;

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
