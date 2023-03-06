function click_split() {
    alert('split')
}

var graph;
function click_load() {
    d3.json('./data/conn2.json').then(function(data){
        graph = readGraphML(data);
    }).then(function(){
        posByOrder(graph.layers[0]);

        for (var i = 1; i < graph.layers.length; i++) {
            posByNeighboursBelow(graph.layers[i])
        }
    }).then(function() {
        draw(graph.nodes, graph.edges);
    });
}

function click_load2() {
    d3.json('./graphs/bone_marrow.json').then(function(data){
        graph = process_hubmap_data(data);
        console.log(graph)
        graph = readGraphML(graph);
        console.log(graph);
    }).then(function(){
        posByOrder(graph.layers[0]);

        for (var i = 1; i < graph.layers.length; i++) {
            posByNeighboursBelow(graph.layers[i])
        }
    }).then(function() {
        draw(graph.nodes, graph.edges);
    });
}

function click_barycenter() {
    console.log(graph);
    barycenter(graph.layers, 10);

    draw(graph.nodes, graph.edges);
}

function click_crossings() {
    var crossings = naiveNumberCrossings(graph.layers);
    console.log(crossings)
    var crossings = numberCrossings(graph.layers);
    console.log(crossings)
}

function click_k_crossings() {
    k_CR_maxSpan(graph, 1, 1);
    //k_CR_maxSpanNodeCount(graph, 1, 1);
    //k_CR_maxCross(graph, 1, 1);
    console.log(graph.layers)
    //barycenter(graph.layers, 10);
    // var crossings = numberCrossings(graph.layers);
    // console.log(crossings)
    //posByOrder(graph.layers[1])
    posByOrder(graph.layers[0])

    var crossings = numberCrossings(graph.layers);
    console.log(crossings)

    draw(graph.nodes, graph.edges);
}

const input = './graphs/large_intestine.json'
function click_experiment() {
    d3.json(input).then(function(data){
        graph = process_hubmap_data(data);
        console.log(graph)
        graph = readGraphML(graph);
        console.log(graph);
    }).then(function(){
        posByOrder(graph.layers[0]);

        for (var i = 1; i < graph.layers.length; i++) {
            posByNeighboursBelow(graph.layers[i])
        }
        
        barycenter(graph.layers, 10);
    }).then(function() {
        draw(graph.nodes, graph.edges);
    }).then(function() {
		var crossings = numberCrossings(graph.layers);
		var crS = "cr;" +  crossings + ";"
		var kS = "k;0" + ";"
		var tS = "t;0" + ";"
		const start = window.performance.now()
		
		for(var i = 0; i < 500; i++) {
			
			k_CR_maxSpan(graph, 1, 1);
			const end = window.performance.now()
			var crossings = numberCrossings(graph.layers);
			
			crS += crossings + ";"
			kS += (i+1) + ";"
			tS += (end - start)  + ";"
			
			if (crossings <= 0) 
				break;
		}
			
		console.log(kS + "\n" + crS + "\n" + tS)
    });
}


function click_experiment2() {

    d3.json(input).then(function(data){
        graph = process_hubmap_data(data);
        console.log(graph)
        graph = readGraphML(graph);
        console.log(graph);
    }).then(function(){
        posByOrder(graph.layers[0]);

        for (var i = 1; i < graph.layers.length; i++) {
            posByNeighboursBelow(graph.layers[i])
        }
        
        barycenter(graph.layers, 10);
    }).then(function() {
        draw(graph.nodes, graph.edges);
    }).then(function() {
		var crossings = numberCrossings(graph.layers);
		var crS = "cr;" +  crossings + ";"
		var kS = "k;0" + ";"
		var tS = "t;0" + ";"
		const start2 = window.performance.now()
		
		for(var i = 0; i < 500; i++) {
			
			k_CR_maxCross(graph, 1, 1);
			const end = window.performance.now()
			barycenter(graph.layers, 10);
			var crossings = numberCrossings(graph.layers);
			
			crS += crossings + ";"
			kS += (i+1) + ";"
			tS += (end - start2)  + ";"
			
			if (crossings <= 0) 
				break;
			}
			
		console.log(kS + "\n" + crS + "\n" + tS)
    });
}


