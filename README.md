```
from collections import deque
def bfs_nearest_exit(grid, start, exits):
  rows, cols = len(grid), len(grid[0])

  #check if starting position is valid
  if grid[start[0]][start[1]] == 1:
    return None
  visited = [[False]*cols for_in range(rows)]
  parent = {}
  queue = deque([start])
  visited[start[0]][start[1]] = True

  while queue:
    current = queue.popleft()
    r,c = current
    if current in exits:
      path = [current]
      while path[-1] != start:
        path.append(parent[path[-1]])
        path.reverse()
        return path
  for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
    nr = r + dr
    nc = c + dc

    if(0 <= nr < rows and
       0 <=nc < cols and
       not visited[nr][nc] and
       grid[nr][nc]==0):
      visited[nr][nc]= True
      parent[(nr,nc)] = current
      queue.append((nr,nc))
    return None

    def exp1_bfs():
      hospital = [
          [0,0,1,0,0,0,0],
          [0,1,1,0,1,1,0],
          [0,0,0,0,1,0,0],
          [1,1,0,1,1,0,1],
          [0,0,0,0,0,0,0],
          [0,1,1,1,1,1,0],
          [0,0,0,0,0,0,0]
      ]

      exits = [(0,0), (6,6)]
      patient_rooms = [(2,2), (4,4), (6,0)]
      print("Hospital Floor Plan")
      print("X = Exit")
      print(". = Corridor")
      print("# = Walls\n")


      for r, row in enumerate(hospital):
        line = []
        for c, val in enumerate(row):
          if(r,c) in exits:
            line.append("X")
            elif val == 1:
              line.append("#")
            else:
              line.append(".")
            print("".join(line))
          print("\n Searching nearest Exit....\n")

          for patient in patient_rooms:
            print("Patient Room:", patient)
            if hospital[patient[0]][patient[1]] == 1:
              print("Patient room is inside a wall. No path Possible. \n")
              continue
            path = bfs_nearest_exit(hospital, patient, exits)
            if path:
              print("Shortest Path")
              print(path)
              print("Number of Steps:" len(path))

      exp1_bfs()
```
