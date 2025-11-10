import React, { createContext, useState, useContext } from "react";

const searchBar = createContext();

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <searchBar.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </searchBar.Provider>
  );
}

export const useSearch = () => useContext(searchBar);