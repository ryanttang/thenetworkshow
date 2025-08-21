"use client";
import { Input, InputGroup, InputLeftElement, Box } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  initialValue?: string;
}

export default function SearchBar({ 
  placeholder = "Search events...", 
  onSearch, 
  debounceMs = 300,
  initialValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  return (
    <Box w="full" maxW="400px">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          _hover={{ borderColor: "gray.300" }}
          _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
        />
      </InputGroup>
    </Box>
  );
}
