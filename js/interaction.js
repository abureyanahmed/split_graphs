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
    barycenter(graph.layers, 10);

    draw(graph.nodes, graph.edges);
}

function click_order() {
    posByOrder(graph.layers[0]);
    posByOrder(graph.layers[1])
    draw(graph.nodes, graph.edges);
}

function click_crossings() {
    var crossings = naiveNumberCrossings(graph.layers);
    console.log(crossings)
    var crossings = numberCrossings(graph.layers);
    console.log(crossings)
}

function click_k_crossings() {
    var startTime = performance.now()
    k_CR_maxSpan(graph, 1, 1);
    //k_CR_maxSpanNodeCount(graph, 1, 1);
    //k_CR_maxCross(graph, 1, 1);
    var endTime = performance.now()
    console.log(endTime - startTime)
    //barycenter(graph.layers, 10);
    // var crossings = numberCrossings(graph.layers);
    // console.log(crossings)
    //posByOrder(graph.layers[1])
    posByOrder(graph.layers[0])

    var crossings = numberCrossings(graph.layers);
    console.log(crossings)

    draw(graph.nodes, graph.edges);
}

function click_experiment() {
    var datasets = ['blood', 'bone_marrow', 'brain', 'eye', 'fallopian_tube', 'heart', 'kidney', 'large_intestine', 'liver', 'lung', 'lymph_nodes', 'ovary', 'pancreas', 'peripheral_nervous_system', 'prostate', 'skin', 'small_intestine', 'spleen', 'thymus', 'ureter', 'urinary_bladder', 'uterus', 'vasculature']
    K = 200;
    s1 = ''
    s2 = ''
    s3 = ''
    max1 = 0;
    max2 = 0;
    max3 = 0;
    datasets.forEach(dataset => {
        d3.json('./graphs/' + dataset + '.json').then(function(data){
            graph = process_hubmap_data(data);
            graph = readGraphML(graph);
        }).then(function(){

            var s = dataset + "; "

            posByOrder(graph.layers[1]);

            graph.layers[0].forEach(node => {
              var barySum = 0;
              node.nAbove.forEach(nB => {
                    barySum += nB['x'];
                });
              node['x'] = barySum / node.nAbove.length;
            });

            graph.layers[0].sort((a,b) => a['x']- b['x']);
            posByOrder(graph.layers[0])

            var crossings = numberCrossings(graph.layers);
            s += String(crossings[0]) + ";"

            for(k = 0; k < K; k++) {
                var startTime = performance.now();
                k_CR_maxCross(graph, 1, 1);
                var endTime = performance.now();
                var time = endTime - startTime;
                max1 = Math.max(max1, time);
                posByOrder(graph.layers[0]);
                var crossings = numberCrossings(graph.layers);
                s += String(crossings[0]) + ";"
            }
            
            //console.log(s);
            s1 += s + '\n';
        }).then(function(){
            console.log('max time CR count: ', max1)
            console.log(s1);
        });
        
        d3.json('./graphs/' + dataset + '.json').then(function(data){
            graph = process_hubmap_data(data);
            graph = readGraphML(graph);
        }).then(function(){

            var s = dataset + "; "

            posByOrder(graph.layers[1]);

            graph.layers[0].forEach(node => {
              var barySum = 0;
              node.nAbove.forEach(nB => {
                    barySum += nB['x'];
                });
              node['x'] = barySum / node.nAbove.length;
            });

            graph.layers[0].sort((a,b) => a['x']- b['x']);
            posByOrder(graph.layers[0])

            var crossings = numberCrossings(graph.layers);
            s += String(crossings[0]) + ";"

            for(k = 0; k < K; k++) {
                var startTime = performance.now();
                k_CR_maxSpan(graph, 1, 1);
                var endTime = performance.now();
                var time = endTime - startTime;
                max2 = Math.max(max2, time);
                posByOrder(graph.layers[0]);
                var crossings = numberCrossings(graph.layers);
                s += String(crossings[0]) + ";"
            }
            
            //console.log(s);
            s2 += s + '\n';
        }).then(function(){
            console.log('max time max span: ', max2)
            console.log(s2);
    });
        
        d3.json('./graphs/' + dataset + '.json').then(function(data){
            graph = process_hubmap_data(data);
            graph = readGraphML(graph);
        }).then(function(){

            var s = dataset + "; "

            posByOrder(graph.layers[1]);

            graph.layers[0].forEach(node => {
              var barySum = 0;
              node.nAbove.forEach(nB => {
                    barySum += nB['x'];
                });
              node['x'] = barySum / node.nAbove.length;
            });

            graph.layers[0].sort((a,b) => a['x']- b['x']);
            posByOrder(graph.layers[0])

            var crossings = numberCrossings(graph.layers);
            s += String(crossings[0]) + ";"

            for(k = 0; k < K; k++) {
                k_CR_maxSpanNodeCount(graph, 1, 1);
                posByOrder(graph.layers[0]);
                var crossings = numberCrossings(graph.layers);
                s += String(crossings[0]) + ";"
            }
            
            //console.log(s);
            s3 += s + '\n';
        }).then(function(){
            console.log(s3);
    });
});


}
