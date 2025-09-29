import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: { 
    heading: "'Inter', 'system-ui', sans-serif", 
    body: "'Inter', 'system-ui', sans-serif" 
  },
  colors: {
    brand: {
      50: "#e6fffa",
      100: "#b2f5ea",
      200: "#81e6d9",
      300: "#4fd1c7",
      400: "#38b2ac",
      500: "#319795",
      600: "#2c7a7b",
      700: "#285e61",
      800: "#234e52",
      900: "#1a202c"
    },
    gradient: {
      purple: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      teal: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      orange: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      green: "linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%)",
      blue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'xl',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          transform: 'translateY(-1px)',
        }
      },
      defaultProps: {
        colorScheme: "teal"
      },
      variants: {
        gradient: {
          bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          _hover: {
            transform: 'translateY(-2px)',
            shadow: 'xl',
            bg: 'linear-gradient(135deg, #43a3f7 0%, #00e6f7 100%)'
          }
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.35)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    Card: {
      baseStyle: {
        borderRadius: '2xl',
        transition: 'all 0.3s ease-in-out',
        _hover: {
          shadow: 'xl',
          transform: 'translateY(-4px)'
        }
      }
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.025em',
        lineHeight: '1.2'
      }
    }
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  }
});

export default theme;
