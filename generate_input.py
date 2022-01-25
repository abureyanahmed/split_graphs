import json

f = open("asct+b_graph_data_selected_organs_2021.11.02_08.32.json", "r")
s = f.read()
f.close()

jsn = json.loads(s)
for i in range(5):
  print(jsn["nodes"][i])
for i in range(5):
  print(jsn["nodes"][len(jsn["nodes"])-i-1])

print("Total nodes:", len(jsn["nodes"]))

print(jsn["edges"][0])
print(jsn["edges"][1])
print(jsn["edges"][2])

print("Total edges:", len(jsn["edges"]))

cnt = 0
for i in range(len(jsn["edges"])):
  s, t = jsn["edges"][i]["source"], jsn["edges"][i]["target"]
  if not jsn["nodes"][s]["type"]=="AS":
    cnt += 1
print("Total edges:", cnt)

print(jsn["edges"][0].keys(), jsn["edges"][0].values())

