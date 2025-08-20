import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: { 
    heading: "'Inter', sans-serif", 
    body: "'Inter', sans-serif" 
  },
  styles: { 
    global: { 
      body: { 
        bg: "gray.50", 
        color: "gray.800" 
      } 
    } 
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "teal"
      }
    }
  }
});

export default theme;
