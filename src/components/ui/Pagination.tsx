"use client";
import { HStack, Button, Text, Select } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
  }

  return (
    <HStack justify="space-between" align="center" w="full" py={4}>
      <Text fontSize="sm" color="gray.600">
        Showing {startItem}-{endItem} of {totalItems} items
      </Text>
      
      <HStack spacing={2}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          leftIcon={<ChevronLeftIcon />}
        >
          Previous
        </Button>
        
        {pageNumbers.map((page, index) => (
          <Button
            key={index}
            size="sm"
            variant={page === currentPage ? "solid" : "outline"}
            colorScheme={page === currentPage ? "blue" : "gray"}
            onClick={() => typeof page === "number" && onPageChange(page)}
            isDisabled={page === "..."}
            minW="40px"
          >
            {page}
          </Button>
        ))}
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          rightIcon={<ChevronRightIcon />}
        >
          Next
        </Button>
      </HStack>
      
      <HStack spacing={2} align="center">
        <Text fontSize="sm" color="gray.600">
          Show:
        </Text>
        <Select
          size="sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          w="70px"
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </Select>
      </HStack>
    </HStack>
  );
}
