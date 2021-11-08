function click_split() {
    alert('split')
}

var graph;
function click_load() {
    d3.json('./data/test_3l.json').then(function(data){
        graph = readGraphML(data);
    }).then(function(){
        posByOrder(graph.layers[0]);

        for (var i = 1; i < graph.layers.length; i++) {
            posByNeighboursBelow(graph.layers[i])
        }
    }).then(function() {
        console.log(graph);
        draw(graph.nodes, graph.edges);
    });
}