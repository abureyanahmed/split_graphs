function click_split() {
    alert('split')
}

var graph;
function click_load() {
    d3.json('./data/test_small.json').then(function(data){
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
    numberCrossings(graph.layers);
}