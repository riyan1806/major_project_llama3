import { Label } from "@radix-ui/react-label";
import { motion, useCycle } from "framer-motion";

const BouncingDotsLoader = () => {
  const [color, cycleColor] = useCycle("#FFFFFF", "#FFFFFF", "#FFFFFF");

  return (

    <div className="flex items-center space-x-2 ">  {/* border-solid border-white border-2 rounded-3xl */}
      <Label className="text-lg font-medium">LOADING... </Label>
      <motion.div
        className="w-4 h-4 bg-black rounded-full"
        style={{ backgroundColor: color }}
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        onClick={() => cycleColor()}
      ></motion.div>
      <motion.div
        className="w-4 h-4 bg-black rounded-full"
        style={{ backgroundColor: color }}
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
        onClick={() => cycleColor()}
      ></motion.div>
      <motion.div
        className="w-4 h-4 bg-black rounded-full"
        style={{ backgroundColor: color }}
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
        onClick={() => cycleColor()}
      ></motion.div>
    </div>
  );
};

export default BouncingDotsLoader;
