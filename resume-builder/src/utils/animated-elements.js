import { motion } from 'framer-motion';


const FlipText = ({children }) => {
  return (
    <motion.span
      className="block relative overflow-hidden font-bold no-wrap"
      initial="initial"
      whileHover="hovered"
      whileTap="hovered"
    >
      {/* {children.split("").map((char, index) => ( */}
        <div>
           {children.split("").map((char, index) => {
            return (<motion.span 
             variants= {{
            initial: { y: 0 },
            hovered: { y: "-100%" }
          }}
          transition={ {
            ease: "easeInOut",
            }}
            
          className="inline-block"
            key={index}>{char === ' ' ? '\u00A0' : char}</motion.span>)
           })}
        </div>


        <div className="absolute inset-0">
           {children.split("").map((char, index) => {
            return (<motion.span 
             variants= {{
            initial: { y: "100%" },
            hovered: { y: 0 }
          }}
          transition={ {
            ease: "easeInOut",
            }}
          className="inline-block"
            key={index}>{char === ' ' ? '\u00A0' : char}</motion.span>)
           })}
        </div>
      {/* ))} */}
    </motion.span>
  );
}

const WaveText = ({ children }) => {
  const words = children.split(" ");
  const perLetterDelay = 0.1;
  let cumulativeDelay = 0;
  return (
    <motion.span
      className="block relative overflow-hidden font-bold"
      initial="initial"
      whileInView="hovered"
    >
      <div className="flex flex-wrap gap-x-2">
        {words.map((word, wordIndex) => {
          const startDelay = cumulativeDelay; // store the current delay
          const letters = word.split("");
          const totalWordDelay = letters.length * perLetterDelay;
          cumulativeDelay += totalWordDelay; // update for next word
          return (
          <span
            key={wordIndex}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={{
                  initial: { y: [0, 0, 0] },
                  hovered: { y: [0, -5, 0] },
                }}
                transition={{
                  ease: "linear", // smooth looping
                  duration: 0.5,
                  delay: startDelay + charIndex * perLetterDelay, // offset per word
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        )})}
      </div>
    </motion.span>
  );
};

export {FlipText, WaveText}