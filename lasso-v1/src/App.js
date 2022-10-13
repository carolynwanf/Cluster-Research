import React from "react";
import "./App.css";

import { MouseDraw } from "./MouseDraw.js";

function App() {
  return (
    <div className="App">
      <svg viewBox="0 0 505 405" width="500px" height="400px">
        <MouseDraw x={0} y={0} width={500} height={400} />
      </svg>
      <div id="chart"></div>
    </div>
  );
}

export default App;
