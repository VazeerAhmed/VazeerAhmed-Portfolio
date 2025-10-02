"use client";

import { motion } from "motion/react";

function PopIn(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay: props.delay || 0.5,
        type: "spring",
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.div>
  );
}

function PopInLi(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.li
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay: props.delay || 0.5,
        type: "spring",
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.li>
  );
}

function HoverPop(props: { children: React.ReactNode; scale?: number }) {
  return (
    <motion.div
      whileHover={{
        scale: props.scale ?? 1.01,
        transition: { duration: 0.2 },
      }}
    >
      {props.children}
    </motion.div>
  );
}

function FadeIn(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        delay: props.delay || 0.5,
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.div>
  );
}

function FadeInLi(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.li
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        delay: props.delay || 0.5,
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.li>
  );
}

function FadeUp(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
  className?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: props.delay || 0.5,
      }}
      key={props.divKey || undefined}
      className={props.className || ""}
    >
      {props.children}
    </motion.div>
  );
}

function FadeDown(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: props.delay || 0.5,
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.div>
  );
}

function FadeLeft(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: props.delay || 0.5,
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.div>
  );
}

function FadeRight(props: {
  children: React.ReactNode;
  delay?: number;
  divKey?: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: props.delay || 0.5,
      }}
      key={props.divKey || undefined}
    >
      {props.children}
    </motion.div>
  );
}

function ClickFadeRight(props: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileTap={{
        opacity: 0.8,
        x: 10,
        transition: { duration: 0.2 },
      }}
      onClick={props.onClick}
      style={{ cursor: "pointer" }}
    >
      {props.children}
    </motion.div>
  );
}

export {
  PopIn,
  FadeIn,
  FadeUp,
  FadeDown,
  FadeLeft,
  FadeRight,
  HoverPop,
  ClickFadeRight,
  PopInLi,
  FadeInLi,
};
