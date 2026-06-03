import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Heading, VStack, Dialog, Button, Text, Center, HStack, Field, Input } from '@chakra-ui/react'
import { useMinesweeper } from './hooks/useMinesweeper.js'
import Scoreboard from './components/Scoreboard.jsx'
import Grid from './components/Grid.jsx'
import LeverSwitch from './components/LeverSwitch.jsx'
import CosmicBackground from './components/CosmicBackground.jsx'
import { playVictory, playExplosion, playChord } from './utils/sound.js'
import { getRecords, saveRecord, getRecord } from './utils/records.js'

const DIFFICULTY_MAP = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 30, cols: 16, mines: 99 },
}

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [modalOpen, setModalOpen] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [newRecord, setNewRecord] = useState(false)
  const [customRows, setCustomRows] = useState(10)
  const [customCols, setCustomCols] = useState(10)
  const [customMines, setCustomMines] = useState(15)
  const [lightMode, setLightMode] = useState(false)
  const timerRef = useRef(null)
  const prevGameOver = useRef(false)
  const prevGameWon = useRef(false)

  const isCustom = difficulty === 'custom'
  const { rows, cols, mines } = isCustom
    ? { rows: customRows, cols: customCols, mines: customMines }
    : DIFFICULTY_MAP[difficulty]
  const { board, gameOver, gameWon, minesLeft, isFirstClick, revealCell, toggleFlag, resetGame } =
    useMinesweeper(rows, cols, mines)

  useEffect(() => {
    setElapsed(0)
    setNewRecord(false)
  }, [difficulty, customRows, customCols, customMines])

  useEffect(() => {
    if (!isFirstClick && !gameOver && !gameWon) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [isFirstClick, gameOver, gameWon])

  useEffect(() => {
    if (gameWon && !prevGameWon.current) {
      playVictory()
      const isNew = saveRecord(difficulty, elapsed)
      setNewRecord(isNew)
      setModalOpen(true)
    }
    if (gameOver && !prevGameOver.current) {
      playExplosion()
      setModalOpen(true)
    }
    prevGameOver.current = gameOver
    prevGameWon.current = gameWon
  }, [gameWon, gameOver, difficulty, elapsed])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light-mode', lightMode)
    if (lightMode) {
      root.style.setProperty('--chakra-colors-bg', '#f5f5fa')
      root.style.setProperty('--chakra-colors-surface', '#ffffff')
      root.style.setProperty('--chakra-colors-border', '#d4d4e0')
      root.style.setProperty('--chakra-colors-text-primary', '#1e1e2e')
      root.style.setProperty('--chakra-colors-text-secondary', '#6b7280')
      root.style.setProperty('--chakra-colors-neon', '#00d4b8')
      root.style.setProperty('--chakra-colors-neon-pink', '#ff2d95')
      root.style.setProperty('--chakra-colors-accent', '#7c3aed')
      root.style.setProperty('--bg-transparent', 'rgba(245, 245, 250, 0.7)')
      root.style.setProperty('--surface-transparent', 'rgba(255, 255, 255, 0.85)')
      root.style.setProperty('--toggle-neon', '#00d4b8')
      root.style.setProperty('--toggle-neon-dim', 'rgba(0, 212, 184, 0.3)')
      root.style.setProperty('--toggle-bg', '#ffffff')
      root.style.setProperty('--toggle-surface', '#e8e8f0')
    } else {
      root.style.setProperty('--chakra-colors-bg', '#0f0f13')
      root.style.setProperty('--chakra-colors-surface', '#1a1a23')
      root.style.setProperty('--chakra-colors-border', '#2a2a3a')
      root.style.setProperty('--chakra-colors-text-primary', '#e2e8f0')
      root.style.setProperty('--chakra-colors-text-secondary', '#94a3b8')
      root.style.setProperty('--chakra-colors-neon', '#00f5d4')
      root.style.setProperty('--chakra-colors-neon-pink', '#ff2d95')
      root.style.setProperty('--chakra-colors-accent', '#7c3aed')
      root.style.setProperty('--bg-transparent', 'rgba(15, 15, 19, 0.7)')
      root.style.setProperty('--surface-transparent', 'rgba(26, 26, 35, 0.85)')
      root.style.setProperty('--toggle-neon', '#00f5d4')
      root.style.setProperty('--toggle-neon-dim', 'rgba(0, 245, 212, 0.3)')
      root.style.setProperty('--toggle-bg', '#1a1a23')
      root.style.setProperty('--toggle-surface', '#2a2a35')
    }
  }, [lightMode])

  const handlePlayAgain = useCallback(() => {
    setModalOpen(false)
    resetGame()
  }, [resetGame])

  const handleDifficultyChange = useCallback((d) => {
    setModalOpen(false)
    setDifficulty(d)
  }, [])

  const bestTime = getRecord(difficulty)

  return (
    <>
      <CosmicBackground lightMode={lightMode} />
      <Center minH="100vh" bg="var(--bg-transparent)" position="relative" zIndex={1}>
      <Box
        bg="var(--surface-transparent)"
        borderWidth="2px"
        borderColor="border"
        borderRadius="2xl"
        boxShadow="0 0 40px rgba(0, 245, 212, 0.08), 0 0 80px rgba(0, 0, 0, 0.4)"
        p={{ base: 3, sm: 4, md: 8 }}
        w="full"
        maxW={rows > 16 ? '850px' : rows > 9 ? '650px' : '420px'}
        mx={2}
      >
        <VStack gap={6}>
          <HStack w="full" justify="space-between" align="center">
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
            <LeverSwitch checked={lightMode} onChange={setLightMode} />
          </HStack>

          <Scoreboard
            mineCount={minesLeft}
            elapsed={elapsed}
            gameWon={gameWon}
            gameOver={gameOver}
            onReset={() => { setModalOpen(false); resetGame() }}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
          />

          {isCustom && (
            <HStack gap={3} w="full" justify="center" flexWrap="wrap">
              <Field.Root w="80px">
                <Field.Label fontSize="xs" color="textSecondary">Filas</Field.Label>
                <Input
                  size="sm"
                  value={customRows}
                  onChange={(e) => setCustomRows(Math.max(5, Math.min(30, Number(e.target.value) || 5)))}
                  color="textPrimary"
                  bg="bg"
                  borderColor="border"
                  textAlign="center"
                  fontFamily="body"
                />
              </Field.Root>
              <Field.Root w="80px">
                <Field.Label fontSize="xs" color="textSecondary">Cols</Field.Label>
                <Input
                  size="sm"
                  value={customCols}
                  onChange={(e) => setCustomCols(Math.max(5, Math.min(30, Number(e.target.value) || 5)))}
                  color="textPrimary"
                  bg="bg"
                  borderColor="border"
                  textAlign="center"
                  fontFamily="body"
                />
              </Field.Root>
              <Field.Root w="80px">
                <Field.Label fontSize="xs" color="textSecondary">Minas</Field.Label>
                <Input
                  size="sm"
                  value={customMines}
                  onChange={(e) => setCustomMines(Math.max(1, Math.min(rows * cols - 1, Number(e.target.value) || 1)))}
                  color="textPrimary"
                  bg="bg"
                  borderColor="border"
                  textAlign="center"
                  fontFamily="body"
                />
              </Field.Root>
            </HStack>
          )}

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
                Tiempo: {fmt(elapsed)}
              </Text>
              {gameWon && newRecord && (
                <Text fontFamily="body" color="neon" fontSize="sm" mt={1} fontWeight="bold">
                  &iexcl;Nuevo r&eacute;cord!
                </Text>
              )}
              {bestTime != null && (
                <Text fontFamily="body" color="textSecondary" fontSize="xs" mt={1}>
                  Mejor tiempo: {fmt(bestTime)}
                </Text>
              )}
            </Dialog.Body>
            <Dialog.Footer justifyContent="center" gap={3}>
              <Dialog.ActionTrigger asChild>
                <Button
                  onClick={handlePlayAgain}
        bg="var(--surface-transparent)"
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
    </>
  )
}

export default App
