# Splitting Vertices in 2-Layer Graph Drawings

To use this software, please click on the "code" menu and then click "Download ZIP". Please extract the folder, and open the file named "index.html" in your browser. There is a textbox on the left side. You can provide input in the textbox in Json format. In the "graphs" folder there exist some Json files. You can open any of those Json files and copy the content inside the input text. Press the "Draw" button to generate a drawing.

![The input layout on the right side appears after inserting the dataset into the text area and clicking the draw button.](./figures/interface_2_in.png)

Press the "Split" button to split some vertices and generate a crossing-free drawing. 

![The output layout appears on the right side after clicking the split button.](./figures/interface_2_out.png)

The right output interface is interactive; the user can see further details using different interactions. 
When the graph is large the user can scroll up and down to see different parts of the layout. 

![zoom_in](./figures/zoom_in.png)

The user can highlight the adjacent edges by clicking on a particular vertex in case of dense layouts.

![The system highlights the adjacent edges when the user clicks on a vertex (in this figure the user clicks the vertex with the label ``basophil'').](./figures/highlight_edges_new.png)


We keep the label texts less than or equal to ten characters. If a label is longer then we show the first ten characters and truncate the rest. If the user puts the mouse over the label or the corresponding vertex, a pop-up message will show the full label. If the user moves out the mouse, the message will be removed too. Besides showing the full label, we also provide other useful information, e.g., the degree and ID of the vertex.


![A pop-up message showing the full label, and other related information.](./figures/popup.png)


The underlying algorithm is described in [this paper](https://arxiv.org/pdf/2301.10872.pdf).
