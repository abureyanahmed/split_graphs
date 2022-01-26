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
    //k_CR_maxSpan(graph, 1, 1);
    //k_CR_maxSpanNodeCount(graph, 1, 1);
    k_CR_maxCross(graph, 1, 1);
    console.log(graph.layers)
    //barycenter(graph.layers, 10);
    posByOrder(graph.layers[0])
    posByOrder(graph.layers[1])

    var crossings = numberCrossings(graph.layers);
    console.log(crossings)

    draw(graph.nodes, graph.edges);
}