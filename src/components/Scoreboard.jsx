import { useState } from 'react'
import { HStack, Text, Button, Select, Box } from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import { Flag } from 'lucide-react'

const difficulties = createListCollection({
  items: [
    { label: 'Fácil (9x9)', value: 'easy' },
    { label: 'Medio (16x16)', value: 'medium' },
    { label: 'Difícil (30x16)', value: 'hard' },
    { label: 'Personalizado', value: 'custom' },
  ],
})

function getFace(gameWon, gameOver, faceHover) {
  if (faceHover) return '\u{1F62E}'
  if (gameWon) return '\u{1F60E}'
  if (gameOver) return '\u{1F480}'
  return '\u{1F642}'
}

function Scoreboard({ mineCount, elapsed, gameWon, gameOver, onReset, difficulty, onDifficultyChange }) {
  const [faceHover, setFaceHover] = useState(false)
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <HStack gap={2} justify="space-between" w="full" flexDir={{ base: 'row', sm: 'row' }} flexWrap="wrap">
      <HStack gap={1}>
        <Flag size={18} color="#ff2d95" fill="#ff2d95" />
        <Text fontFamily="body" fontWeight="bold" color="neonPink" fontSize={{ base: 'md', sm: 'lg' }} minW="36px" textAlign="center">
          {String(mineCount).padStart(3, '0')}
        </Text>
      </HStack>

      <Text fontFamily="body" fontWeight="bold" color="neon" fontSize={{ base: 'md', sm: 'lg' }} minW="52px" textAlign="center">
        {fmt(elapsed)}
      </Text>

      <Button
        onClick={onReset}
        onMouseDown={() => setFaceHover(true)}
        onMouseUp={() => setFaceHover(false)}
        onMouseLeave={() => setFaceHover(false)}
        fontSize="2xl"
        lineHeight="1"
        w={{ base: '40px', sm: '48px' }}
        h={{ base: '40px', sm: '48px' }}
        p={0}
        borderRadius="md"
        bg="surface"
        borderWidth="2px"
        borderColor="border"
        _hover={{ bg: 'whiteAlpha.200' }}
        _active={{ bg: 'whiteAlpha.300' }}
      >
        {getFace(gameWon, gameOver, faceHover)}
      </Button>

      <Box minW={{ base: '120px', sm: '140px' }} order={{ base: 0, sm: 2 }}>
        <Select.Root
          collection={difficulties}
          value={[difficulty]}
          onValueChange={(e) => onDifficultyChange(e.value[0])}
          size="sm"
        >
          <Select.Trigger color="textPrimary" css={{ '& svg': { color: '#e2e8f0' } }}>
            <Select.ValueText />
          </Select.Trigger>
          <Select.Content bg="surface" borderColor="border">
            {difficulties.items.map((item) => (
              <Select.Item item={item} key={item.value} color="textPrimary" _hover={{ bg: 'whiteAlpha.200' }}>
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>
    </HStack>
  )
}

export default Scoreboard
