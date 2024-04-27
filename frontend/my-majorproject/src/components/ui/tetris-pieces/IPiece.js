import { forwardRef } from "react";
import { motion } from "framer-motion";

import "./styles.css";

const IPiece = forwardRef(({ className }, ref) => {
  return (
    <div ref={ref} className={`iPiece ${className}`}>
      <div />
    </div>
  );
});

export default motion(IPiece);
