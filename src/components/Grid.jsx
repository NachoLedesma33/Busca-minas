import { Grid as ChakraGrid, Box } from '@chakra-ui/react'
import Cell from './Cell.jsx'

function Grid({ board, gameOver, onReveal, onToggleFlag }) {
  const rows = board.length
  const cols = board[0]?.length || 0

  return (
    <Box overflowX="auto" w="full" sx={{ scrollbarWidth: 'thin' }}>
      <ChakraGrid
        templateColumns={`repeat(${cols}, minmax(28px, 1fr))`}
        gap="1px"
        bg="border"
        p="1px"
        borderRadius="md"
        w="fit-content"
        mx="auto"
      >
        {board.map((row) =>
          row.map((cell) => (
            <Cell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              gameOver={gameOver}
              onReveal={onReveal}
              onToggleFlag={onToggleFlag}
            />
          ))
        )}
      </ChakraGrid>
    </Box>
  )
}

export default Grid
