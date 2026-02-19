"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function AnimatedList({ children, delay = 1000, className }) {
  const [messages, setMessages] = useState([]);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length < childrenArray.length) {
        setMessages((prev) => [...prev, childrenArray[messages.length]]);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [childrenArray, delay, messages.length]);

  return (
    <div className={className}>
      <AnimatePresence>
        {messages.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}