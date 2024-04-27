"use client";
import React from "react";
import { SparklesCore } from "@/components/herosection_homepage";
import { WavyBackground } from "@/custom_components/wavy_bg";
import { TypewriterEffectSmooth } from "@/custom_components/TypeWriter";
import { HoverBorderGradient } from "@/custom_components/border_button";
import Link from "next/link";


export default function SparklesPreview() {

  const words = [
    {
      text: "SUMMARIZE",
    },
    {
      text: "CONTENT",
    },
    {
      text: "IN",
    },
    {
      text: "ONE",
    },
    {
      text: "CLICK.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <WavyBackground>

      <h1 className="md:text-7xl text-3xl lg:text-7xl font-bold text-center text-white relative z-30 -mt-10">
        AI SUMMARIZATION 
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        

        {/* Core component */}
        {/* <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
          /> */}

        {/* Radial Gradient to prevent sharp edges */}
      </div>
      <div className=" flex justify-center text-center mt-32">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black bg-black text-white dark:text-white flex items-center space-x-2"
      >
        <Link href={{pathname: '/main'}}>
        <span>GET STARTED</span>
        </Link>
      </HoverBorderGradient>
    </div>
      <TypewriterEffectSmooth words={words} className="justify-center fixed bottom-[10px] left-[430px]" />
      
      </WavyBackground>
      
    </div>
  );
}
