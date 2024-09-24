"use client";

import ListRowDisposition from "./list_row_disposition";

interface ListHeaderProps {
  headers: { label: string; key: string }[];
  className?: string;
}

const ListHeader = ({ headers, className = "" }: ListHeaderProps) => {
  return (
    <div className={`flex items-center justify-between p-4  ${className}`}>
      <ListRowDisposition>
        <>
          <span key={headers[0].key} className="flex-1 text-center text-s">
            {headers[0].label}
          </span>
        </>
        <>
          <span key={headers[1].key} className="flex-1 text-center text-s">
            {headers[1].label}
          </span>
        </>
        <>
          {headers.slice(2).map((header) => (
            <span key={header.key} className="flex-1 text-center ">
              {header.label}
            </span>
          ))}
        </>
      </ListRowDisposition>
    </div>
  );
};

export default ListHeader;
