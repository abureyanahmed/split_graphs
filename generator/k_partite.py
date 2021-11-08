import argparse
import networkx as nx
import json
import random
from networkx.readwrite import json_graph


def generate(outfile, layers):
    """
    Converts GraphML file to json while adding communities/modularity groups
    using python-louvain. JSON output is usable with D3 force layout.
    Usage:
    >>> python convert.py -i mygraph.graphml -o outfile.json
    """
    G = nx.Graph()	

    indices = [] 
    i = 0
    for layer in layers:
        for n1 in range(layer[1]):
            G.add_node(i, layer=layer[0])
            i += 1

        indices.append(i)

    i = 0
    j = 1
    indStart = 0
    print(indices)
    while j < len(layers):
        subG = nx.Graph()

        l0 = layers[i]
        l1 = layers[j]

        indMid = indices[i]
        indEnd = indices[j]

        for n1 in range(indStart, indMid):
            for n2 in range(indMid, indEnd):
                subG.add_edge(n1, n2)

        for u,v in random.sample(subG.edges, l1[2]):
            G.add_edge(u,v)

        print(len(G.nodes), len(G.edges))

        indStart = indMid
        i = j
        j += 1


    node_link = json_graph.node_link_data(G)
    data = json.dumps(node_link)

    # Write to file
    fo = open(outfile, "w")
    fo.write(data)
    fo.close()

def check(layers):
    layers = sorted(layers, key=lambda x: x[0])

    i = 0
    for l in layers:
        l = list(map(int, l))

        if l[0] != i:
            return None
        if l[1] <= 0:
             return None
        if i > 0 and len(l) < 2:
            return None
        if i > 0 and l[2] <= 0:
            return None

        layers[i] = l
        i += 1

    return layers

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert from GraphML to json. ')
    parser.add_argument('-o','--output', help='Output file name/path',required=True)
    parser.add_argument('-l', '--layer', help='Add a level l with n nodes using m connections to a lower level.  e.g. l n m: 1 100 200', action='append', nargs='+')
    args = parser.parse_args()

    layers = check(args.layer)

    if layers == None:
        print('Layer input wrong.')
    else:
        generate(args.output, layers)