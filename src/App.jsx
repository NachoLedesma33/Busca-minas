import { useState, useEffect, useRef } from 'react'
import { Box, Heading, VStack, Dialog, Button, Text, Center } from '@chakra-ui/react'
import { useMinesweeper } from './hooks/useMinesweeper.js'
import Scoreboard from './components/Scoreboard.jsx'
import Grid from './components/Grid.jsx'

const DIFFICULTY_MAP = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 30, cols: 16, mines: 99 },
}

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [modalOpen, setModalOpen] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const { rows, cols, mines } = DIFFICULTY_MAP[difficulty]
  const { board, gameOver, gameWon, minesLeft, isFirstClick, revealCell, toggleFlag, resetGame } =
    useMinesweeper(rows, cols, mines)

  useEffect(() => {
    setElapsed(0)
  }, [difficulty])

  useEffect(() => {
    if (!isFirstClick && !gameOver && !gameWon) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [isFirstClick, gameOver, gameWon])

  useEffect(() => {
    if (gameWon || gameOver) setModalOpen(true)
  }, [gameWon, gameOver])

  const handlePlayAgain = () => {
    setModalOpen(false)
    resetGame()
  }

  const handleDifficultyChange = (d) => {
    setModalOpen(false)
    setDifficulty(d)
  }

  return (
    <Center minH="100vh" bg="bg">
      <Box
        bg="surface"
        borderWidth="2px"
        borderColor="border"
        borderRadius="2xl"
        boxShadow="0 0 40px rgba(0, 245, 212, 0.08), 0 0 80px rgba(0, 0, 0, 0.4)"
        p={{ base: 3, sm: 4, md: 8 }}
        w="full"
        maxW={cols > 16 ? '850px' : cols > 9 ? '650px' : '420px'}
        mx={2}
      >
        <VStack gap={6} textAlign="center">
          <Heading
            as="h1"
            fontSize={{ base: '2xl', md: '4xl' }}
            fontFamily="heading"
            bgGradient="to-r"
            gradientFrom="neon"
            gradientTo="neonPink"
            bgClip="text"
            letterSpacing="wider"
          >
            Buscaminas Arcade
          </Heading>

          <Scoreboard
            mineCount={minesLeft}
            elapsed={elapsed}
            gameWon={gameWon}
            gameOver={gameOver}
            onReset={() => { setModalOpen(false); resetGame() }}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
          />

          {board.length > 0 && (
            <Grid
              board={board}
              gameOver={gameOver}
              onReveal={revealCell}
              onToggleFlag={toggleFlag}
            />
          )}

          <Text
            fontSize="xs"
            color="textSecondary"
            fontFamily="body"
            opacity={0.5}
            pt={2}
          >
            &copy; {new Date().getFullYear()} NachoLedesma33 &mdash; Todos los derechos reservados
          </Text>
        </VStack>
      </Box>

      <Dialog.Root open={modalOpen} onOpenChange={(e) => setModalOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" borderColor={gameWon ? 'neon' : 'neonPink'} borderWidth="2px">
            <Dialog.Header>
              <Dialog.Title
                fontFamily="heading"
                textAlign="center"
                color={gameWon ? 'neon' : 'neonPink'}
                fontSize="2xl"
              >
                {gameWon ? '¡Victoria!' : 'Game Over'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body textAlign="center" pb={4}>
              <Text fontFamily="body" color="textSecondary" fontSize="lg">
                {gameWon
                  ? 'Has despejado todas las minas. ¡Impresionante!'
                  : 'Has pisado una mina. ¡Mejor suerte la próxima!'}
              </Text>
              <Text fontFamily="body" color="textPrimary" fontSize="sm" mt={2}>
                Tiempo: {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
              </Text>
            </Dialog.Body>
            <Dialog.Footer justifyContent="center" gap={3}>
              <Dialog.ActionTrigger asChild>
                <Button
                  onClick={handlePlayAgain}
                  bg="surface"
                  borderWidth="1px"
                  borderColor={gameWon ? 'neon' : 'neonPink'}
                  color={gameWon ? 'neon' : 'neonPink'}
                  _hover={{ bg: gameWon ? 'neon' : 'neonPink', color: 'bg', transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                  fontFamily="body"
                >
                  Jugar de nuevo
                </Button>
              </Dialog.ActionTrigger>
              <Dialog.CloseTrigger asChild>
                <Button
                  variant="ghost"
                  color="textSecondary"
                  _hover={{ color: 'textPrimary' }}
                  fontFamily="body"
                >
                  Cerrar
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Center>
  )
}

export default App
