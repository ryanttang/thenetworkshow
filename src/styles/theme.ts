import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: { 
    heading: "'Changa One', 'system-ui', sans-serif", 
    body: "'Inter', 'system-ui', sans-serif" 
  },
  colors: {
    brand: {
      50: "#e6f2ff",
      100: "#b3d9ff",
      200: "#80c0ff",
      300: "#4da6ff",
      400: "#3c7da0",
      500: "#3c7d9f",
      600: "#2d5f7a",
      700: "#1e4155",
      800: "#0f2330",
      900: "#00050b"
    },
    gradient: {
      purple: "linear-gradient(135deg, #3c7d9f 0%, #3c7da0 100%)",
      teal: "linear-gradient(135deg, #3c7d9f 0%, #3c7da0 100%)",
      orange: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      green: "linear-gradient(135deg, #3c7d9f 0%, #3c7da0 100%)",
      blue: "linear-gradient(135deg, #3c7d9f 0%, #3c7da0 100%)"
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
        colorScheme: "brand"
      },
      variants: {
        gradient: {
          bg: 'linear-gradient(135deg, #3c7d9f 0%, #3c7da0 100%)',
          color: 'white',
          _hover: {
            transform: 'translateY(-2px)',
            shadow: 'xl',
            bg: 'linear-gradient(135deg, #2d5f7a 0%, #1e4155 100%)'
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
