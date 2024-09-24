"use client";
import React from "react";
import ListRowDisposition from "./list_row_disposition";

interface ListRowProps {
  children: React.ReactNode[];
  className?: string;
}

const ListRow = ({ children, className = "" }: ListRowProps) => {
  return (
    <div
      className={`flex items-center justify-between p-4 border border-white border-opacity-25 bg-white  bg-opacity-[3%] rounded-md mb-2 ${className}`}
    >
      <ListRowDisposition>
        <> {children?.at(0)}</>
        <> {children?.at(1)}</>
        <> {children?.at(2)}</>
      </ListRowDisposition>
    </div>
  );
};

export default ListRow;
