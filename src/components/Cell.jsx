import { Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Flag, Bomb } from 'lucide-react'

const NUMBER_COLORS = {
  1: 'blue.400',
  2: 'green.400',
  3: 'red.400',
  4: 'purple.400',
  5: 'rose.500',
  6: 'teal.400',
  7: 'gray.800',
  8: 'gray.500',
}

function Cell({ cell, gameOver, onReveal, onToggleFlag }) {
  const { isMine, isRevealed, isFlagged, neighborMines } = cell

  const handleClick = () => {
    if (gameOver) return
    if (isFlagged) return
    onReveal(cell.row, cell.col)
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (gameOver) return
    if (isRevealed) return
    onToggleFlag(cell.row, cell.col)
  }

  const showMine = isRevealed && isMine
  const showFlag = isFlagged && !isRevealed
  const showNumber = isRevealed && !isMine && neighborMines > 0
  const showEmpty = isRevealed && !isMine && neighborMines === 0

  let bg = 'surface'
  let cursor = 'pointer'
  let _hover = {}

  if (!isRevealed && !isFlagged) {
    bg = 'surface'
    _hover = { bg: 'whiteAlpha.200' }
  } else if (showFlag) {
    bg = 'surface'
  } else if (showMine) {
    bg = 'red.600'
    cursor = 'default'
  } else if (isRevealed) {
    bg = 'whiteAlpha.100'
    cursor = 'default'
  }

  const staggerDelay = cell.row * 0.015 + cell.col * 0.008

  return (
    <motion.div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0 }}
      animate={
        isRevealed
          ? { scale: 1, opacity: 1, transition: { delay: staggerDelay, duration: 0.2, ease: 'easeOut' } }
          : { scale: 1, opacity: 1 }
      }
      initial={false}
    >
      <Box
        aspectRatio={1}
        bg={bg}
        borderWidth="1px"
        borderColor="border"
        borderRadius="md"
        cursor={cursor}
        _hover={_hover}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        transition="all 0.15s ease"
        userSelect="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minW={0}
        minH={0}
        w="full"
      >
        {showFlag && (
          <Box as="span" fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} lineHeight={1}>
            <Flag size="1em" color="#ff2d95" fill="#ff2d95" />
          </Box>
        )}
        {showMine && (
          <Box as="span" fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} lineHeight={1}>
            <Bomb size="1em" color="#fff" fill="#fff" />
          </Box>
        )}
        {showNumber && (
          <Text
            fontWeight="bold"
            fontSize={{ base: '0.7em', sm: '0.8em', md: '1em' }}
            color={NUMBER_COLORS[neighborMines] || 'white'}
            fontFamily="body"
            lineHeight={1}
          >
            {neighborMines}
          </Text>
        )}
        {showEmpty && null}
      </Box>
    </motion.div>
  )
}

export default Cell
