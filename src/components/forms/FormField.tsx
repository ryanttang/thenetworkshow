"use client";
import { FormControl, FormLabel, FormErrorMessage, Input, Textarea, Select } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "url" | "number" | "textarea" | "select";
  placeholder?: string;
  error?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  register: UseFormRegisterReturn;
}

export default function FormField({ 
  label, 
  name, 
  type = "text", 
  placeholder, 
  error, 
  required,
  options,
  register 
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return <Textarea {...register} placeholder={placeholder} rows={4} />;
      case "select":
        return (
          <Select {...register} placeholder={placeholder}>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      default:
        return <Input {...register} type={type} placeholder={placeholder} />;
    }
  };

  return (
    <FormControl isInvalid={!!error} isRequired={required}>
      <FormLabel>{label}</FormLabel>
      {renderInput()}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}
