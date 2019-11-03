import React from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import styled from "styled-components";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import CssBaseline from "@material-ui/core/CssBaseline";
import StarIcon from "@material-ui/icons/Star";
import StarOutlinedIcon from "@material-ui/icons/StarBorder";
import _flatten from "lodash/flatten";
import _memoize from "lodash/memoize";
import * as PF from "pathfinding";
import matrixJs from "matrix-js";

import { Toolbar } from "./toolbar";
//import stuff from "./stuff"

const algorithms = [
  "AStarFinder",
  "BestFirstFinder",
  "BreadthFirstFinder",
  "DijkstraFinder",
  "IDAStarFinder",
  "JumpPointFinder",
  "BiAStarFinder",
  "BiBestFirstFinder",
  "BiBreadthFirstFinder",
  "BiDijkstraFinder"
];

// A matrix of the game map. 1 for non-walkable; 0 for walkable
const size = 20;
const matrix = [
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 1, 1, 1, 1, 1,1, 1, 1, 1,1, 1, 1, 1, 1,1, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 1, 0, 0, 1, 0, 0,1, 0, 0, 1, 0, 0, 1,0, 0, 1, 0,0, 1, 0, 0, 1,0, 0, 1, 0, 0,1, 0, 0, 1, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 1, 1,1, 1, 1, 1,1, 1, 1, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],
  [0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 1, 1,1, 1, 1, 1,1, 1, 1, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0, 0,0,0,0,0,0],


];

var shoppingList = [];
shoppingList.push([1, 4], [6, 3], [15, 10], [15, 12],[21,12], [13, 13], [18,11]);
var checkoutSquares = [];
checkoutSquares.push([13,18],[13,19],[14,19],[15,19],[16,19],[17,19],[18,19],[19,19],[20,19],[21,19],[14,18],[15,18],[16,18],[17,18],[18,18],[19,18],[20,18],[21,18])


function getIndexFromPosition(x, y, size) {
  return x * size + y;
}

// For future reference
// function getPositionFromIndex(i, size) {
//   return {
//     x: Math.floor(i / size),
//     y: i % size
//   };
// }

// create a "grid" from the original matrix
function getGridFromMatrix({ matrix }) {
  return new PF.Grid([...matrix]);
}

// Convert the matrix above to a flat array of tile objects
// with their x,y position and own index
function getTilesFromMatrix({ matrix }) {
  return _flatten(
    // Flatten the result of...
    matrixJs(matrix) // The matrix utility so we can...
      .trans() // Transpose (rotate 90 degrees) so it's not weird
      .map((column, x) =>
        column.map((value, y) => ({
          x, // the column
          y, // the row
          isItem: shoppingList.find(function(e) {
            return e[0] === x && e[1] === y;
          }) !== undefined,
          walkable: value !== 1, // 0 for walkable, 1 for not
          i: getIndexFromPosition(x, y), // the correct index number
          inPath: false, // no path yet!
          isStart: false, // no starting tile yet!
          isEnd: false // no ending tile yet!
        }))
      )
  );
}

const getPathFinder = _memoize(
  ({ algorithm, allowDiagonal }) => {
    return new PF[algorithm]({
      allowDiagonal
    });
  },
  ({ algorithm, allowDiagonal }) => algorithm + allowDiagonal
);

function getPositionsAreEqual(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

function computeTiles({ start, end, algorithm, allowDiagonal, matrix }) {
  const tiles = getTilesFromMatrix({ matrix });
  if (start) {
    tiles[getIndexFromPosition(start.x, start.y, size)].isStart = true;
  }
  if (end) {
    tiles[getIndexFromPosition(end.x, end.y, size)].isEnd = true;
  }
  if (start && end) {
    const pathFinder = getPathFinder({ algorithm, allowDiagonal });
    var visits = tiles.filter(function(t) {
      return t.isItem;
    }).sort((a, b) => (a.x === b.x ? (b.y - a.y) : b.x - a.x));
    console.log(visits);
    visits.unshift(start);
    visits.push(end);
    const grid = getGridFromMatrix({ matrix });
    console.log(grid);
    var path = [];
    if (visits.length > 1) {
      for (var i = 0; i < visits.length - 1; i++) {
        var temppath = pathFinder.findPath(visits[i].x, visits[i].y, visits[i + 1].x, visits[i + 1].y, grid);
        console.log(grid);
        temppath.forEach((item) => {
          path.push(item);
        });
        console.log(path);
        console.log(temppath);
      }
    }

    
    path.forEach(([x, y]) => {
      tiles[getIndexFromPosition(x, y, size)].inPath = true;
    });
  }
  return tiles;

  // const tiles = getTilesFromMatrix({ matrix });
  // if (start) {
  //   tiles[getIndexFromPosition(start.x, start.y, size)].isStart = true;
  // }
  // if (end) {
  //   tiles[getIndexFromPosition(end.x, end.y, size)].isEnd = true;
  // }
  // if (start && end) {
  //   const pathFinder = getPathFinder({ algorithm, allowDiagonal });
    
  //   var visits = tiles.filter(function(t) {
  //     return t.isItem;
  //   }).sort((a, b) => (a.x === b.x ? (b.y - a.y) : b.x - a.x));
  //   console.log(start);
  //   console.log(visits[0]);
  //   let x1 = JSON.parse(JSON.stringify(start));
  //   x1.x = visits[0].x;
  //   x1.y = visits[0].y
  //   let x2 = JSON.parse(JSON.stringify(end));
  //   x2.x = visits[1].x;
  //   x2.y = visits[1].y
  //   const grid = getGridFromMatrix({ matrix });
  //   const path = pathFinder.findPath(x1.x, x1.y, x2.x, x2.y, grid);
  //   console.log(path);
  //   path.forEach(([x, y]) => {
  //     tiles[getIndexFromPosition(x, y, size)].inPath = true;
  //   });
  // }
  // return tiles;
}

const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

const initialState = {
  start: {
    inPath: false,
    isEnd: false,
    isStart: true,
    walkable: true,
    x: 36,
    y: 19,
    isItem: false },// starting tile for pathfinding
  end: {
    inPath: false,
    isEnd: true,
    isStart: false,
    walkable: true,
    x: 17, 
    y: 17,
    isItem:false }, // ending tile
  pathSet: true,
  algorithm: "BestFirstFinder", // the pathfinding algorithm to use
  allowDiagonal: true, // optionally allow diagonal paths
  matrix,
  editMode: false
};

function reducer(state, action) {
  
  switch (action.type) {
    case "tile clicked": {
      const { tile } = action;
      if (state.editMode) {
        const matrixTile = (state.matrix[tile.y][tile.x] ^= 1);
        if (
          matrixTile &&
          (getPositionsAreEqual(state.end, tile) ||
            getPositionsAreEqual(state.start, tile))
        ) {
          state.start = null;
          state.end = null;
          state.pathSet = false;
        }
      } else if (state.pathSet && tile.walkable) {
        state.pathSet = false;
        state.start = tile;
        state.end = null;
        console.log(state);
        console.log(tile);
        console.log(action);
      } else if (state.start && tile.walkable) {
        state.pathSet = true;
      } else if (tile.walkable) {
        state.start = tile;
      }
      return;
    }

    case "mouse entered tile": {
      const { tile } = action;
      if (
        !state.editMode &&
        !state.pathSet &&
        state.start &&
        tile.walkable &&
        !tile.isStart
      ) {
        state.end = tile;
      }
      return;
    }

    case "algorithm changed": {
      state.algorithm = action.algorithm;
      return;
    }

    case "allow diagonal toggled": {
      state.allowDiagonal = !state.allowDiagonal;
      return;
    }

    case "edit mode toggled": {
      state.editMode = !state.editMode;
      return;
    }

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const tiles = computeTiles(state);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Toolbar
        algorithm={state.algorithm}
        algorithms={algorithms}
        handleAlgorithmChange={e =>
          dispatch({ type: "algorithm changed", algorithm: e.target.value })
        }
        allowDiagonal={state.allowDiagonal}
        handleAllowDiagonalChange={() =>
          dispatch({ type: "allow diagonal toggled" })
        }
        handleEditModeChange={() => dispatch({ type: "edit mode toggled" })}
      />
      <GameContainer>
        <GridContainer>
          {tiles.map((tile, i) => (
            <Tile
              key={i}
              tile={tile}
              onClick={() => dispatch({ type: "tile clicked", tile })}
              onMouseEnter={() =>
                dispatch({ type: "mouse entered tile", tile })
              }
              editMode={state.editMode}
            >
              <TileIcon tile={tile} pathSet={state.pathSet} />
            </Tile>
          ))}
        </GridContainer>
      </GameContainer>
    </MuiThemeProvider>
  );
}

const GameContainer = styled(Paper)`
  display: inline-block;
  margin: 120px 24px 24px 300px;
  
	font-family: "Exo", sans-serif;
	color: #fff;
	background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
	background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  @keyframes gradientBG {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;


const GridContainer =
 styled.div`
  display: grid;
  grid-template-rows: repeat(20, 30px);
  grid-auto-flow: column;
  grid-auto-columns: 30px;
  grid-auto-rows: 30px;
`;

function getHoverColor({ editMode, tile }) {
  if (editMode) {
    return tile.walkable ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.6)";
  } else {
    return tile.walkable ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.8)";
  }
}

const Tile = styled.div`
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  background-color: ${props => 
    checkoutSquares.find(function(e) {
      return e[0] === props.tile.x && e[1] === props.tile.y;
    }) !==  undefined ? "AntiqueWhite": (props.tile.isItem ? "OrangeRed" : (props.tile.walkable ? "Transparent" : "rgba(0,0,0,0.8)"))};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  &:hover {
    background-color: ${getHoverColor};
  }
`;


function getIconColor(tile) {
  if (tile.isStart) {
    return "Chartreuse";
  } else if (tile.isEnd) {
    return "OrangeRed";
  } else if (tile.inPath) {
    return "#4C9A2A";
  }
   else {
    return "AntiqueWhite";
  }
  
}

function TileIcon({ tile, pathSet }) {
  if (tile.isStart || tile.inPath || tile.isEnd) {
    const color = getIconColor(tile);
    if (tile.isEnd && !pathSet) {
      return <StarOutlinedIcon fontSize="large" style={{ color }} />;
    } else {
      return <StarIcon fontSize="large" style={{ color }} />;
    }
  }
  return null;
}




const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);



