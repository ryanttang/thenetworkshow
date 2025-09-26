import { Box, Grid, GridItem, Image, Link, Text, VStack } from "@chakra-ui/react";

async function getPosts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/instagram/posts`, { cache: "no-store" });
  const json = await res.json();
  return json.posts as Array<any>;
}

export default async function InstagramPublicPage() {
  const posts = await getPosts();

  return (
    <Box px={6} py={10} maxW="1200px" mx="auto">
      <VStack align="start" spacing={4} mb={6}>
        <Text fontSize="3xl" fontWeight="bold">Instagram</Text>
        <Text color="gray.600">Latest public posts</Text>
      </VStack>
      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        {posts.map((p) => (
          <GridItem key={p.id}>
            <Link href={p.permalink} target="_blank" rel="noopener noreferrer">
              <Image src={p.mediaUrl} alt={p.caption ?? "Instagram post"} objectFit="cover" borderRadius="md" />
            </Link>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
}


