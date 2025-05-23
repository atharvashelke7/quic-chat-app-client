import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[rgba(231,76,60,0.7)] z-[2] flex items-center justify-center">
      <div className="inline-block relative w-20 h-20">
        <div className="block absolute box-border border-8 border-white rounded-full w-0 h-0 m-2 border-t-transparent border-b-transparent animate-spinner" />
      </div>
    </div>
  );
};

export default Loader;
