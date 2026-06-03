import { useReducer, useCallback, useEffect } from 'react'

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

function createCell(row, col, isMine = false) {
  return { row, col, isMine, isRevealed: false, isFlagged: false, neighborMines: 0 }
}

function computeNeighbors(board, rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue
      let count = 0
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
          count++
        }
      }
      board[r][c].neighborMines = count
    }
  }
}

function initializeBoard(rows, cols, mines) {
  const board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => createCell(r, c))
  )

  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!board[r][c].isMine) {
      board[r][c].isMine = true
      placed++
    }
  }

  computeNeighbors(board, rows, cols)
  return board
}

function moveMineAway(board, row, col, rows, cols) {
  if (!board[row][col].isMine) return false
  board[row][col].isMine = false

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine && !(r === row && c === col)) {
        board[r][c].isMine = true
        computeNeighbors(board, rows, cols)
        return true
      }
    }
  }
  return true
}

function checkWin(board) {
  return board.every(row =>
    row.every(cell => cell.isMine || cell.isRevealed)
  )
}

function floodReveal(board, row, col, rows, cols) {
  const queue = [[row, col]]
  const newBoard = board.map(r => r.map(c => ({ ...c })))

  while (queue.length > 0) {
    const [r, c] = queue.shift()
    const cell = newBoard[r][c]
    if (cell.isRevealed || cell.isFlagged) continue

    cell.isRevealed = true

    if (cell.neighborMines === 0) {
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighbor = newBoard[nr][nc]
          if (!neighbor.isRevealed && !neighbor.isFlagged) {
            queue.push([nr, nc])
          }
        }
      }
    }
  }

  return newBoard
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT_BOARD': {
      const board = initializeBoard(action.rows, action.cols, action.mines)
      return {
        board,
        rows: action.rows,
        cols: action.cols,
        totalMines: action.mines,
        minesLeft: action.mines,
        gameOver: false,
        gameWon: false,
        isFirstClick: true,
      }
    }

    case 'REVEAL_CELL': {
      if (state.gameOver || state.gameWon) return state
      const { row, col } = action
      const cell = state.board[row][col]
      if (cell.isFlagged) return state

      let board = state.board.map(r => r.map(c => ({ ...c })))

      if (cell.isRevealed) {
        if (cell.neighborMines === 0) return state
        let flagCount = 0
        for (const [dr, dc] of DIRECTIONS) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            if (board[nr][nc].isFlagged) flagCount++
          }
        }
        if (flagCount !== cell.neighborMines) return state

        for (const [dr, dc] of DIRECTIONS) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            const n = board[nr][nc]
            if (n.isRevealed || n.isFlagged) continue
            if (n.isMine) {
              n.isRevealed = true
              return { ...state, board, gameOver: true, isFirstClick: false }
            }
            board = floodReveal(board, nr, nc, state.rows, state.cols)
          }
        }
        const gameWon = checkWin(board)
        return { ...state, board, gameWon, isFirstClick: false }
      }

      if (state.isFirstClick && board[row][col].isMine) {
        moveMineAway(board, row, col, state.rows, state.cols)
      }

      if (board[row][col].isMine) {
        board[row][col].isRevealed = true
        return { ...state, board, gameOver: true, isFirstClick: false }
      }

      board = floodReveal(board, row, col, state.rows, state.cols)
      const gameWon = checkWin(board)

      return { ...state, board, gameWon, isFirstClick: false }
    }

    case 'TOGGLE_FLAG': {
      if (state.gameOver || state.gameWon) return state
      const { row, col } = action
      const cell = state.board[row][col]
      if (cell.isRevealed) return state

      const newBoard = state.board.map(r => r.map(c => ({ ...c })))
      newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged

      const delta = newBoard[row][col].isFlagged ? -1 : 1

      return { ...state, board: newBoard, minesLeft: state.minesLeft + delta }
    }

    case 'RESET_GAME': {
      const board = initializeBoard(state.rows, state.cols, state.totalMines)
      return {
        ...state,
        board,
        minesLeft: state.totalMines,
        gameOver: false,
        gameWon: false,
        isFirstClick: true,
      }
    }

    default:
      return state
  }
}

const initialState = {
  board: [],
  rows: 0,
  cols: 0,
  totalMines: 0,
  minesLeft: 0,
  gameOver: false,
  gameWon: false,
  isFirstClick: true,
}

export function useMinesweeper(rows = 9, cols = 9, mines = 10) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const resetGame = useCallback(() => {
    dispatch({ type: 'INIT_BOARD', rows, cols, mines })
  }, [rows, cols, mines])

  const revealCell = useCallback((row, col) => {
    dispatch({ type: 'REVEAL_CELL', row, col })
  }, [])

  const toggleFlag = useCallback((row, col) => {
    dispatch({ type: 'TOGGLE_FLAG', row, col })
  }, [])

  useEffect(() => {
    dispatch({ type: 'INIT_BOARD', rows, cols, mines })
  }, [rows, cols, mines])

  return {
    board: state.board,
    gameOver: state.gameOver,
    gameWon: state.gameWon,
    minesLeft: state.minesLeft,
    isFirstClick: state.isFirstClick,
    revealCell,
    toggleFlag,
    resetGame,
  }
}
