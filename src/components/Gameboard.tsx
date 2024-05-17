import { MazeTileData } from '@/contexts/GameContextProvider';
import { useContext } from 'react';
import { GameContext } from '@/contexts/GameContextProvider';

export function Gameboard() {
  const {
    mazeData,
    playerPosition,
    direction,
    selectedColorSet,
    lastCellX,
    setLastCellX,
    lastCellY,
    setLastCellY,
    calculateBlurRadius,
    handleTouchStart,
    handleTouchMove,
  } = useContext(GameContext);

  // Check if the game has started for the first time
  const gameStarted = playerPosition !== null;

  // Check if the player position has changed
  const playerMoved =
    gameStarted &&
    (lastCellX !== playerPosition.x || lastCellY !== playerPosition.y);

  // Update last player position
  setLastCellX(playerPosition!.x);
  setLastCellY(playerPosition!.y);

  return mazeData.map((row: MazeTileData[], rowIndex: number) => (
    <div key={rowIndex} className="mazeRow">
      {row.map((cell: MazeTileData, colIndex: number) => {
        const blurRadius = playerMoved
          ? calculateBlurRadius(colIndex, rowIndex)
          : 0;
        const applyBlur = blurRadius > 0; // Determine if blur should be applied

        // Define cell content based on cell type
        let cellContent = '';
        if (cell.hasCheese) cellContent = '🧀';
        else if (cell.hasEnemy) cellContent = '👾';
        else if (cell.hasExit) cellContent = '🚪';
        else if (cell.hasCartel) cellContent = '🤮';
        else if (cell.enemyWon) cellContent = '💢';

        return (
          <div
            key={colIndex}
            id={`cell-${rowIndex}-${colIndex}`}
            className="mazeCell"
            style={{
              backgroundColor: cell.isPath
                ? selectedColorSet.pathColor
                : selectedColorSet.backgroundColor,
              filter: applyBlur ? `blur(${blurRadius}px)` : 'none', // Apply blur conditionally
              position: 'relative', // Ensure relative positioning for absolute positioning of icons
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Dynamic content based on cell */}
            {cellContent && (
              <span
                role="img"
                aria-label={cellContent}
                className="static-icon"
                style={{ position: 'absolute' }}
              >
                {cellContent}
              </span>
            )}

            {/* Player icon */}
            {playerPosition!.x === colIndex &&
              playerPosition!.y === rowIndex && (
                <div
                  className={`mazeCell playerCell player-icon ${direction} playerMove${
                    direction.charAt(0).toUpperCase() + direction.slice(1)
                  }`} // Apply dynamic CSS class based on the direction
                  // Applying the direction style dynamically
                  style={{
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '70%',
                    position: 'relative',
                    zIndex: '2', // Ensure player is in the forefront
                    backgroundImage:
                      cell.enemyWon || cell.hasCartel || cell.hasExit
                        ? 'none'
                        : "url('https://lh3.googleusercontent.com/d/114_RLl18MAzX035svMyvNJpE3ArfLNCF=w500')",
                  }}
                ></div>
              )}
          </div>
        );
      })}
    </div>
  ));
}
