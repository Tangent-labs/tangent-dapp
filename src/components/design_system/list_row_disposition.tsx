"use client";
import React from "react";

interface ListRowDispositionProps {
  children: React.ReactNode[];
}

const ListRowDisposition = ({ children }: ListRowDispositionProps) => {
  return (
    <>
      <div className="flex items-center justify-start w-1/3 ">
        <div className="w-2/3">{children?.at(0)}</div>
        <div className="">{children?.at(1)}</div>
      </div>
      <div className="flex items-center justify-evenly w-2/3 ">
        {children?.at(2)}
      </div>
    </>
  );
};

export default ListRowDisposition;
