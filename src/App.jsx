import { useRef, createRef, useState } from "react";
import cursorSrc from "./assets/cursor2.gif";
import "./App.css";

const cursorSize = 60;
const halfCursorSize = cursorSize / 2;

const data = [
  {
    key: 1,
    color: "blue",
    hex: "#294cb2",
    x: 10,
    y: 10,
  },
  {
    key: 2,
    color: "red",
    hex: "#e74c3c",
    x: 40,
    y: 60,
  },
  {
    key: 3,
    color: "yellow",
    hex: "#f4d03f",
    x: 70,
    y: 30,
  },
  {
    key: 4,
    color: "black",
    hex: "#111",
    x: 50,
    y: 40,
  },
];

const allowed = (color, status) => {
  if (color === "black") return true;
  if (!status.black) return true;
  return false;
};

const getStageStyle = (status) => {
  if (status.black) {
    return "#111";
  }
  if (status.yellow) {
    if (status.blue) {
      return "#1abc9c";
    }
    if (status.red) {
      return "#e67e22";
    }
    return "#f4d03f";
  }
  if (status.red) {
    if (status.blue) {
      return "#884ea0";
    }
    if (status.yellow) {
      return "#e67e22";
    }
    return "#e74c3c";
  }
  if (status.blue) {
    if (status.red) {
      return "#884ea0";
    }
    if (status.yellow) {
      return "#e67e22";
    }
    return "#294cb2";
  }
  return "#ddd";
};

const getNewStatus = (status, color) => {
  if (color === "black") {
    if (!status.black && status.ry && status.rb && status.yb) {
      return {
        ...status,
        black: true,
        bb: true,
      };
    }
    return {
      ...status,
      ry: null,
      rb: null,
      yb: null,
      bb: null,
      black: !status.black,
      red: false,
      yellow: false,
      blue: false,
    };
  }
  if (!status.black) {
    let newStatus = {
      ...status,
      [color]: !status[color],
    };
    newStatus = {
      ...newStatus,
      ry: newStatus.red && newStatus.yellow ? true : status.ry,
      rb: newStatus.red && newStatus.blue ? true : status.rb,
      yb: newStatus.yellow && newStatus.blue ? true : status.yb,
    };
    if (newStatus.red && newStatus.yellow && newStatus.blue) {
      return {
        ...status,
        ry: null,
        rb: null,
        yb: null,
        bb: null,
        black: false,
        red: false,
        yellow: false,
        blue: false,
      };
    }
    return newStatus;
  }
  return status;
};

const getDialogue = (element, status) => {
  if (status.black) {
    if (element.color === "black") {
      return "A switch button";
    }
    return "A disabled button";
  }
  return `A ${element.color} switch`;
};

function App() {
  const [status, setStatus] = useState({
    black: true,
    red: false,
    yellow: false,
    blue: false,
    ry: null,
    rb: null,
    yb: null,
    bb: null,
  });
  const [hovered, setHovered] = useState(null);
  const cursorRef = useRef();
  const cursorUIRef = useRef();
  const buttonsRef = useRef(data.map(() => createRef()));

  const moveCursor = (e) => {
    const mouseY = e.clientY;
    const mouseX = e.clientX;

    const rects = buttonsRef.current.map((buttonRef) =>
      buttonRef.current
        ? buttonRef.current.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 }
    );

    const { dx, dy } = rects.reduce((min, current) => {
      const centerX = current.left + current.width / 2;
      const centerY = current.top + current.height / 2;
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      if (
        min === null ||
        Math.abs(dx) + Math.abs(dy) < Math.abs(min.dx) + Math.abs(min.dy)
      )
        return { dx, dy };
      return min;
    }, null);

    const a = Math.atan2(dx, dy) * -1;

    cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    const aR = a + Math.PI / 4;
    cursorUIRef.current.style.transform = `translate3d(${-halfCursorSize}px, ${-halfCursorSize}px, 0) rotate(${aR}rad`;
  };

  return (
    <div
      className="stage"
      onMouseMove={moveCursor}
      style={{ backgroundColor: getStageStyle(status) }}
    >
      <div className="cursor" ref={cursorRef}>
        <img src={cursorSrc} className="cursorUI" ref={cursorUIRef} />
      </div>
      {status.bb ? (
        <div className="end">
          <h1>will-o-the-wisp</h1>
          <h2>thanks for playing</h2>
        </div>
      ) : (
        <>
          <div className="canvas">
            {data.map((element, index) => {
              const enabled = allowed(element.color, status);
              return (
                <button
                  ref={buttonsRef.current[index]}
                  onMouseEnter={() => {
                    setHovered(element);
                  }}
                  onMouseLeave={() => {
                    setHovered((prev) => (prev === element ? null : prev));
                  }}
                  onClick={() => {
                    const { color } = element;
                    setStatus((prev) => getNewStatus(prev, color));
                  }}
                  key={element.key}
                  style={{
                    position: "absolute",
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: "4%",
                    height: "2%",
                    backgroundColor: element.hex,
                  }}
                ></button>
              );
            })}
          </div>
          <div className="dialogue">
            {hovered
              ? getDialogue(hovered, status)
              : `Find the solution: ${status.rb ? "will" : "____"}-${
                  status.ry ? "o" : "_"
                }-${status.yb ? "the" : "___"}-${status.bb ? "wisp" : "____"}`}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
