import React from "react";
import { FiSearch } from "react-icons/fi";

const Search = ({ searchKey, setSearchKey }) => {
  return (
    // .user-search-area → Tailwind: mb-5 relative
    <div className="mb-5 relative">
      {/* .user-search-text → Tailwind */}
      <input
        type="text"
        placeholder="Search..."
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
        className="w-full h-10 px-5 py-2 border border-[#ddd] rounded-full text-[#28282B] outline-none"
      />
      {/* .user-search-btn → Tailwind */}
      <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-[25px] text-[#e74c3c]" />
    </div>
  );
};

export default Search;
