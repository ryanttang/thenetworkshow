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
  Divider,
  HStack
} from "@chakra-ui/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password",
          status: "error",
          duration: 5000,
        });
      } else {
        toast({
          title: "Signed in successfully",
          status: "success",
          duration: 3000,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description: "An error occurred during Google authentication",
        status: "error",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <Box maxW="md" mx="auto" bg="white" p={8} borderRadius="xl" boxShadow="lg">
        <VStack spacing={6}>
          <Heading size="lg">Sign In</Heading>
          
          <Box as="form" onSubmit={handleCredentialsSignIn} w="100%">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="teal"
                w="100%"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <Divider />
          
          <Button
            onClick={handleGoogleSignIn}
            w="100%"
            variant="outline"
            isLoading={isLoading}
          >
            Continue with Google
          </Button>

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
