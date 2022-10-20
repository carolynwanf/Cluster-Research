import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { useEffect, useState } from "react";

import { MouseDraw } from "./MouseDraw.js";
// import classNames from "classnames/bind";
import { Header } from "./Navbar.js";

function App() {
  return (
    <div className="App">
      <Header />

      <MouseDraw
        x={0}
        y={0}
        width={window.innerWidth - 640}
        height={window.innerHeight - 50}
      />
    </div>
  );
}

export default App;
