import style from "./App.css";
import React, { useEffect, useState } from "react";
import ResizePanel from "./ResizePanel";

import { MouseDraw } from "./MouseDraw.js";
// import classNames from "classnames/bind";

function App() {
  return (
    <div className="App">
      <div className="container">
        <ResizePanel direction="s">
          <div className="header panel">
            <span>header</span>
          </div>
        </ResizePanel>
        <div className="body">
          <ResizePanel direction="e" style={{ flexGrow: "1" }}>
            <div className="sidebar withMargin panel">
              left panel
              <br /> with margin <br />
              default 50% of content area using flex-grow
            </div>
          </ResizePanel>
          <div className="content panel">
            <svg
              id="containerSVG"
              viewBox="0 0 505 405"
              width="500px"
              height="400px"
            >
              <MouseDraw x={0} y={0} width={500} height={400} />
            </svg>
          </div>
          <ResizePanel
            direction="w"
            style={{ width: "400px" }}
            handleClass={style.customHandle}
            borderClass={style.customResizeBorder}
          >
            <div className="sidebar panel">
              right panel
              <br /> with custom handle
              <br /> default 400px
            </div>
          </ResizePanel>
        </div>

        <ResizePanel direction="n" style={{ height: "200px" }}>
          <div className="footer panel">
            <div className="footerArea">
              <div className="footerAreaContent">
                <span>footer area, min height: 100px</span>
              </div>
            </div>
            <div className="footerBottomBar">bottom bar</div>
          </div>
        </ResizePanel>
      </div>
    </div>
  );
}

export default App;
