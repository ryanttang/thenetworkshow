"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  useToast,
  Alert,
  AlertIcon
} from "@chakra-ui/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        setError("Please enter a valid email address");
        return;
      }

      // Validate password
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password");
        } else if (result.error === "RateLimit") {
          setError("Too many attempts. Please try again later.");
        } else {
          setError("Sign in failed. Please try again.");
        }
        toast({
          title: "Sign in failed",
          description: result.error === "RateLimit" ? "Too many attempts. Please try again later." : "Invalid email or password",
          status: "error",
          duration: 5000,
        });
      } else if (result?.ok) {
        toast({
          title: "Signed in successfully",
          status: "success",
          duration: 3000,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <Box maxW="md" mx="auto" bg="white" p={8} borderRadius="xl" boxShadow="lg">
        <VStack spacing={6}>
          <Heading size="lg">Sign In</Heading>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <Box as="form" onSubmit={handleCredentialsSignIn} w="100%">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </FormControl>
              
              <Button
                type="submit"
                w="100%"
                bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                color="white"
                shadow="md"
                fontWeight="600"
                isLoading={isLoading}
                loadingText="Signing in..."
                _hover={{
                  bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
                transition="all 0.3s ease-in-out"
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <Text fontSize="sm" color="gray.600" textAlign="center">
            Demo accounts:<br />
            admin@example.com / admin123!<br />
            organizer@example.com / organizer123!
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
