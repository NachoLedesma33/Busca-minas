import { Box, Heading, Text, VStack } from '@chakra-ui/react'

function App() {
  return (
    <Box
      display="flex"
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      bg="bg"
      color="textPrimary"
    >
      <VStack gap={6} textAlign="center">
        <Heading
          as="h1"
          fontSize={{ base: '3xl', md: '5xl' }}
          fontFamily="heading"
          bgGradient="to-r"
          gradientFrom="neon"
          gradientTo="neonPink"
          bgClip="text"
          letterSpacing="wider"
        >
          Buscaminas Arcade
        </Heading>
        <Text fontSize="lg" color="textSecondary" fontFamily="body">
          Listo para jugar
        </Text>
      </VStack>
    </Box>
  )
}

export default App
