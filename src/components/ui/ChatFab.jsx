import { useEffect, useRef, useState } from "react";
import { MdChat } from "react-icons/md";
import ChatBot from "./ChatBot";

const BUTTON_SIZE = 60;
const INITIAL_RIGHT = 30;
const INITIAL_BOTTOM = 68;
const WINDOW_WIDTH = 380;
const WINDOW_HEIGHT = 550;
const EDGE_MARGIN = 12;

// Clamp the drag offset so the button always stays fully on screen
function clampButton(x, y) {
  const minX = EDGE_MARGIN + BUTTON_SIZE + INITIAL_RIGHT - window.innerWidth;
  const maxX = INITIAL_RIGHT - EDGE_MARGIN;
  const minY = EDGE_MARGIN + BUTTON_SIZE + INITIAL_BOTTOM - window.innerHeight;
  const maxY = INITIAL_BOTTOM - EDGE_MARGIN;
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

export default function ChatFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null); // { startX, startY, originX, originY }
  const movedRef = useRef(false);

  const handlePointerDown = (e) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    movedRef.current = false;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    setOffset(
      clampButton(dragRef.current.originX + dx, dragRef.current.originY + dy)
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleClick = () => {
    // Ignore clicks that are actually the end of a drag
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    setIsOpen((prev) => !prev);
  };

  // Keep the button on screen if the viewport is resized
  useEffect(() => {
    const onResize = () => setOffset((pos) => clampButton(pos.x, pos.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Chat window sits just above the button, clamped to the viewport
  const windowRight = Math.max(
    EDGE_MARGIN,
    Math.min(
      INITIAL_RIGHT - offset.x,
      window.innerWidth - WINDOW_WIDTH - EDGE_MARGIN
    )
  );
  const windowBottom = Math.max(
    EDGE_MARGIN,
    Math.min(
      INITIAL_BOTTOM + BUTTON_SIZE + EDGE_MARGIN - offset.y,
      window.innerHeight - WINDOW_HEIGHT - EDGE_MARGIN
    )
  );

  const scale = isHovered || isDragging ? 1.1 : 1;

  return (
    <>
      <ChatBot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={{ right: windowRight, bottom: windowBottom }}
      />
      <button
        type="button"
        aria-label="Open AI chat assistant"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          right: INITIAL_RIGHT,
          bottom: INITIAL_BOTTOM,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF8040 0%, #FF6B35 100%)",
          border: "none",
          color: "white",
          cursor: isDragging ? "grabbing" : "grab",
          boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          zIndex: 999,
          opacity: isHovered || isDragging ? 1 : 0.45,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <MdChat size={28} />
      </button>
    </>
  );
}
