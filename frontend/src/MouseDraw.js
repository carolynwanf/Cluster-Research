import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import * as d3 from "d3";
import { drawGraph, checkPoints, reset } from "./graph.js";
import "./App.css";

// Line element
const Line = ({ points, drawing }) => {
  const line = useMemo(() => {
    return d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);
  }, []);

  var dataCopy = points;
  // console.log(points);

  // Closes loop if done drawing
  if (dataCopy.length > 0 && !drawing) {
    dataCopy = [...dataCopy, points[0]];
  }

  return (
    <path
      id="lasso"
      d={line(dataCopy)}
      style={{
        stroke: "black",
        strokeWidth: 2,
        strokeLinejoin: "round",
        strokeLinecap: "round",
        fill: "rgba(0,100,255,0.2)",
      }}
    />
  );
};

export const MouseDraw = ({ x, y, width, height }) => {
  // States and state setters
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState({ points: [] });

  const drawingAreaRef = useRef();

  // When the mouse moves, adds the newest point to the list of points for the current line
  const mouseMove = useCallback(
    function (event) {
      const [x, y] = d3.pointer(event);
      if (drawing) {
        setCurrentLine((line) => ({
          ...line,
          points: [...line.points, { x, y }],
        }));
      }
    },
    [drawing]
  );

  // Creates a new line and starts drawing
  function enableDrawing() {
    reset();
    setCurrentLine({ points: [] });
    setDrawing(true);
  }

  // Adds the new line to the array of lines, stops drawing
  function disableDrawing() {
    setDrawing(false);
  }

  // Called mouseMove on mouseover of the drawing area
  useEffect(() => {
    const area = d3.select(drawingAreaRef.current);
    area.on("mousemove", mouseMove);
    return () => area.on("mousemove", null);
  }, [mouseMove]);

  // Check if points are in path on mouseup
  useEffect(() => {
    const area = d3.select(drawingAreaRef.current);
    area.on("mouseup", checkPoints);
    return () => area.on("mouseup", null);
  }, [checkPoints]);

  // Draw graph ONCE when the component mounts
  useEffect(() => {
    console.log("running effect");
    drawGraph();
  }, []);

  return (
    <svg>
      <g
        transform={`translate(${85 / 2}, ${20 / 2})`}
        ref={drawingAreaRef}
        onMouseDown={enableDrawing}
        onMouseUp={disableDrawing}
      >
        {/* Drawing background, gives "g" its size */}
        <rect
          x={0}
          y={0}
          width={width - 85}
          height={height - 50}
          style={{ fill: "white" }}
        />
        {/* Renders lines */}
        <Line points={currentLine.points} drawing={drawing} />
      </g>
    </svg>
  );
};