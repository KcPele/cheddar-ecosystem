import { Gameboard } from './Gameboard';
import { PlinkoBoard } from '../plinko/PlinkoGameboard';
import styles from '@/styles/GameboardContainer.module.css';
import {
  Button,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  MouseEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { GameContext } from '@/contexts/maze/GameContextProvider';
import { ModalBuyNFT } from '../ModalBuyNFT';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import { ModalContainer } from '../ModalContainer';
import { RenderCheddarIcon } from './RenderCheddarIcon';
import { IsAllowedResponse } from '@/hooks/maze';
import ModalNotAllowedToMint from './ModalNotAllowedToMint';
import ModalRules from './ModalRules';
import { GameOverModalContent } from './GameOverModalContent';
import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import { Scoreboard } from './Scoreboard';
import { callMintCheddar } from '@/queries/maze/api';
import { getConfig } from '@/configs/config';
import ModalHolonym from '../ModalHolonymSBT';

interface Props {
  remainingMinutes: number;
  remainingSeconds: number;
  handlePowerUpClick: MouseEventHandler<HTMLButtonElement>;
  cellSize: number;
  hasEnoughBalance: boolean | null;
  minCheddarRequired: number;
  isAllowedResponse: IsAllowedResponse | null | undefined;
}

interface CheddarMintResponse {
  ok?: boolean;
  cheddarMinted?: number;
}
export function GameboardContainer({
  remainingMinutes,
  remainingSeconds,
  handlePowerUpClick,
  cellSize,
  hasEnoughBalance,
  minCheddarRequired,
  isAllowedResponse,
}: Props) {
  const {
    mazeData,
    score,
    gameOverFlag,
    gameOverMessage,
    hasPowerUp,
    handleKeyPress,
    restartGame,
    timerStarted,
    setGameOverMessage,
    saveResponse,
    plinkoModalOpened,
    closePlinkoModal,
    nfts,
    handleArrowPress,
    showMovementButtons,
    setShowMovementButtons,
    onOpenScoreboard,
    isScoreboardOpen,
    onCloseScoreboard,
    isMobile,
    earnedButNotMintedCheddar,
    isUserNadabotVerfied,
    isUserHolonymVerified,
    totalMintedCheddarToDate,
  } = useContext(GameContext);

  const gameboardRef = useRef<HTMLDivElement>(null);
  const {
    isOpen: isOpenNotAlloWedModal,
    onOpen: onOpenNotAlloWedModal,
    onClose: onCloseNotAlloWedModal,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allowOpenGameOverModal, setAllowOpenGameOverModal] = useState(false);

  if (gameOverFlag && gameOverMessage.length > 0 && !allowOpenGameOverModal) {
    onOpen();
    setAllowOpenGameOverModal(true);
  }

  const {
    isOpen: isOpenModalRules,
    onOpen: onOpenModalRules,
    onClose: onCloseModalRules,
  } = useDisclosure();

  const {
    isOpen: isOpenBuyNFTPanel,
    onOpen: onOpenBuyNFTPanel,
    onClose: onCloseBuyNFTPanel,
  } = useDisclosure();

  const { modal, selector, accountId } = useWalletSelector();

  const [showMintErrorModal, setMintErrorModal] = useState(false);
  const [cheddarMintResponse, setCheddarMintResponse] =
    useState<CheddarMintResponse | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (
      cheddarMintResponse &&
      cheddarMintResponse?.ok &&
      cheddarMintResponse.cheddarMinted &&
      cheddarMintResponse.cheddarMinted > 0
    ) {
      toast({
        title: 'Cheddar Minted Successfully!',
        status: 'success',
        duration: 9000,
        position: 'bottom-right',
        isClosable: true,
      });
    }

    if (cheddarMintResponse && !cheddarMintResponse?.ok) {
      toast({
        title: 'Error Minting Cheddar',
        status: 'error',
        duration: 9000,
        position: 'bottom-right',
        isClosable: true,
      });
    }
  }, [cheddarMintResponse, toast]);

  function getProperHandler(handler: any) {
    //Uncomment the next line to ignore the isAllowedResponse.ok returning false
    // return handler;
    if (isAllowedResponse?.ok) {
      return handler;
    }
    return onOpenNotAlloWedModal;
  }

  function getGameContainerClasses() {
    return `${styles.gameContainer}`;
    // return `${styles.gameContainer} backgroundImg${selectedColorSet}`;
  }

  function handleBuyClick() {
    return selector.isSignedIn() ? onOpenBuyNFTPanel() : modal.show();
  }

  function logOut() {
    selector.wallet().then((wallet) => wallet.signOut());
  }

  function focusMazeAndStartGame() {
    gameboardRef.current?.focus();
    restartGame();
  }

  function getStartGameButtonHandler() {
    return accountId //If the accountId exists
      ? getProperHandler(focusMazeAndStartGame)
      : modal.show; //If accountId doesn't exist
  }

  function getKeyDownMoveHandler() {
    return timerStarted ? getProperHandler(handleKeyPress) : () => {};
  }

  function getStartButtonStyles() {
    return `${styles.rulesButton} ${timerStarted ? styles.hideButton : ''}`;
  }

  function closeGameOverModal() {
    setGameOverMessage('');
    onClose();
    setAllowOpenGameOverModal(false);
  }

  function handleToggleShowMovementButtons() {
    setShowMovementButtons(!showMovementButtons);
  }

  const renderSwipeIcon = () => {
    return (
      <svg viewBox="0 -1.5 21 21">
        <title>swipe</title>
        <defs></defs>
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g
            id="Dribbble-Light-Preview"
            transform="translate(-139.000000, -800.000000)"
            fill="#000000"
          >
            <g id="icons" transform="translate(56.000000, 160.000000)">
              <path
                d="M87.2,645.00025 C87.2,644.44825 86.7296,644.00025 86.15,644.00025 L84.05,644.00025 C83.4704,644.00025 83,644.44825 83,645.00025 C83,645.55225 83.4704,646.00025 84.05,646.00025 L86.15,646.00025 C86.7296,646.00025 87.2,645.55225 87.2,645.00025 M103.38575,643.83125 L103.01195,643.47425 L99.67295,640.29325 C99.2624,639.90225 98.5967,639.90225 98.1872,640.29325 C97.77665,640.68425 97.77665,641.31725 98.1872,641.70725 L99.95225,643.26825 C100.283,643.58325 100.04885,644.00025 99.58055,644.00025 L94.18985,644.00025 C93.6092,644.00025 93.13985,644.44825 93.13985,645.00025 C93.13985,645.55225 93.6092,646.00025 94.18985,646.00025 L99.58265,646.00025 C100.05095,646.00025 100.2851,646.66025 99.95435,646.97525 L98.1872,648.71725 C97.7777,649.10825 97.7777,649.77125 98.1872,650.16225 C98.59775,650.55225 99.2624,650.56725 99.6719,650.17725 L103.38575,646.64825 C104.20475,645.86725 104.20475,644.61225 103.38575,643.83125 M97.3451,653.04225 L96.9965,656.59925 C96.80015,657.53425 95.9381,658.00025 94.93745,658.00025 L89.8607,658.00025 C89.51525,658.00025 89.1908,658.04525 88.9955,657.77425 L86.7275,653.84725 C86.4419,653.45425 86.49125,652.92325 86.8451,652.58625 C87.3008,652.15225 88.05575,652.21425 88.42535,652.71625 L89.3,653.90925 L89.3,645.41425 C89.3,644.86225 89.7746,644.41425 90.3542,644.41425 C91.10075,644.41425 91.4084,645.06025 91.4084,645.41425 L91.4168,650.45825 L95.94965,650.85625 C96.9545,651.17425 97.553,652.05325 97.3451,653.04225"
                id="swipe-toggle-icon"
              ></path>
            </g>
          </g>
        </g>
      </svg>
    );
  };

  const renderArrowsIcon = () => {
    return (
      <svg
        fill="#000000"
        viewBox="-6 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>arrows</title>
        <path d="M19.72 15.4l-2.24-2.2c-0.32-0.32-0.84-0.32-1.2 0-0.32 0.32-0.32 0.84 0 1.2l0.8 0.8h-6.28v-6.24l0.8 0.8c0.16 0.16 0.36 0.24 0.6 0.24 0.2 0 0.44-0.080 0.6-0.24 0.32-0.32 0.32-0.84 0-1.2l-2.24-2.24c-0.6-0.72-1.2-0.040-1.2-0.040l-2.24 2.24c-0.32 0.32-0.32 0.84 0 1.2 0.32 0.32 0.84 0.32 1.2 0l0.8-0.8v6.28h-6.2l0.8-0.8c0.32-0.32 0.32-0.84 0-1.2-0.32-0.32-0.84-0.32-1.2 0l-2.24 2.24c-0.32 0.32-0.32 0.84 0 1.16l2.24 2.2c0.16 0.16 0.36 0.24 0.6 0.24 0.2 0 0.44-0.080 0.6-0.24 0.32-0.32 0.32-0.84 0-1.2l-0.8-0.8h6.24v6.24l-0.8-0.8c-0.32-0.32-0.84-0.32-1.2 0-0.32 0.32-0.32 0.84 0 1.2l2.24 2.24c0.4 0.4 0.68 0.4 1.12-0.040l2.24-2.24c0.44-0.28 0.44-0.8 0.080-1.12-0.32-0.32-0.84-0.32-1.2 0l-0.8 0.8v-6.28h6.24l-0.8 0.8c-0.32 0.32-0.32 0.84 0 1.2 0.16 0.16 0.36 0.24 0.6 0.24s0.44-0.080 0.6-0.24l2.24-2.24c0.32-0.28 0.32-0.88 0-1.16z"></path>
      </svg>
    );
  };

  function getPowerUpBtnText() {
    if (accountId) {
      if (nfts?.length) {
        return '⚡';
      } else return 'Buy ⚡';
    } else {
      return 'Buy ⚡';
    }
  }
  const shareReferralLink =
    'https://' +
    new URL(window.location.href).host +
    `?referralId=${accountId}`;

  const notAllowedToPlay =
    (!isUserNadabotVerfied &&
      !isUserHolonymVerified &&
      earnedButNotMintedCheddar >= 100) ||
    (!hasEnoughBalance && earnedButNotMintedCheddar >= 100) ||
    (!hasEnoughBalance && totalMintedCheddarToDate >= 100);

  const [showHolonymModal, setHolonymModal] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Link copied successfully!',
      status: 'success',
      duration: 9000,
      position: 'bottom-right',
      isClosable: true,
    });
  }

  const { nadaBotUrl, buyCheddarInRefUrl } = getConfig().networkData;

  function getErrorText() {
    const nadabotLink = (
      <Link
        href={nadaBotUrl}
        style={{ textDecoration: 'underline' }}
        target="_blank"
      >
        Nadabot
      </Link>
    );

    const holonymLink = (
      <Link
        onClick={() => setHolonymModal(true)}
        style={{ textDecoration: 'underline' }}
        target="_blank"
      >
        Holonym
      </Link>
    );

    const refLink = (
      <Link
        href={buyCheddarInRefUrl}
        style={{ textDecoration: 'underline' }}
        target="_blank"
      >
        Ref
      </Link>
    );

    const cheddarIcon = RenderCheddarIcon({ width: '1rem' });

    let message;

    if (!isUserNadabotVerfied && !isUserHolonymVerified && !hasEnoughBalance) {
      message = (
        <>
          Verify on {nadabotLink} or {holonymLink} and buy/hold 555{' '}
          {cheddarIcon} from {refLink}.
        </>
      );
    } else if (
      (isUserNadabotVerfied || isUserHolonymVerified) &&
      !hasEnoughBalance
    ) {
      message = (
        <>
          Buy/hold 555 {cheddarIcon} from {refLink}.
        </>
      );
    } else if (
      !isUserNadabotVerfied &&
      !isUserHolonymVerified &&
      hasEnoughBalance
    ) {
      message = (
        <>
          Verify on {nadabotLink} or {holonymLink}.
        </>
      );
    }

    return <span>{message}</span>;
  }

  return (
    <div
      className={getGameContainerClasses()}
      onKeyDown={getKeyDownMoveHandler()}
      style={{
        maxWidth: `${mazeData[0].length * cellSize + 50}px`,
      }}
    >
      <div className={styles.publicityDecoration}></div>
      <ModalHolonym
        isOpen={showHolonymModal}
        onClose={() => setHolonymModal(false)}
      />
      {notAllowedToPlay && (
        <div className={styles.notAllowedToPlayText}>
          To keep playing and claim rewards: {getErrorText()}
        </div>
      )}
      <h1 className={styles.gameName}>Cheddar Maze</h1>
      <div className={styles.gameInfo}>
        <div className={styles.score}>Score: {score}</div>
        <div className={styles.time}>
          Time:{' '}
          {remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}:
          {remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}
        </div>
      </div>
      <div className={styles.mazeContainer} ref={gameboardRef} tabIndex={0}>
        <div className={styles.toolbar}>
          {earnedButNotMintedCheddar > 0 && (
            <Button
              px={{ base: 2, md: 3 }}
              _hover={{ bg: 'yellowgreen' }}
              isLoading={isClaiming}
              onClick={async () => {
                if (!isUserNadabotVerfied && !isUserHolonymVerified) {
                  setMintErrorModal(true);
                  return;
                } else {
                  setIsClaiming(true);
                  const response = await callMintCheddar({
                    accountId: accountId as string,
                  });
                  setIsClaiming(false);
                  setCheddarMintResponse(response);
                }
              }}
            >
              {earnedButNotMintedCheddar} 🧀
            </Button>
          )}
          {showMintErrorModal && (
            <ModalNotAllowedToMint
              isOpen={showMintErrorModal}
              onClose={() => setMintErrorModal(!showMintErrorModal)}
              earnedButNotMintedCheddar={earnedButNotMintedCheddar}
            />
          )}
          <span className={styles.rulesButton}>
            <Button
              px={{ base: 2, md: 3 }}
              _hover={{ bg: 'yellowgreen' }}
              onClick={onOpenModalRules}
            >
              Rules
            </Button>
          </span>
          <div className={styles.toolbar}>
            <Button
              px={{ base: 2, md: 3 }}
              _hover={{ bg: 'yellowgreen' }}
              onClick={onOpenScoreboard}
            >
              🏆
            </Button>
            {(isUserNadabotVerfied || isUserHolonymVerified) && (
              <Menu>
                <MenuButton _hover={{ bg: 'yellowgreen' }} as={Button}>
                  🔗
                </MenuButton>
                <MenuList
                  minWidth="auto"
                  p="0"
                  borderRadius="full"
                  bg="yellowCheddar"
                >
                  <MenuItem
                    onClick={() => copyToClipboard(shareReferralLink)}
                    className={styles.referralLink}
                  >
                    {shareReferralLink}
                    <CopyIcon />
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
            <Tooltip label={'Cheddy PowerUp boosts 🧀 and wins'}>
              <Button
                px={{ base: 2, md: 3 }}
                colorScheme={nfts && nfts.length > 0 ? 'green' : 'yellow'}
                onClick={handleBuyClick}
              >
                {getPowerUpBtnText()}
              </Button>
            </Tooltip>
          </div>
          <Show below="lg">
            <Button
              px={{ base: 2, md: 3 }}
              onClick={() => handleToggleShowMovementButtons()}
              colorScheme="gray"
            >
              <div className={styles.togglePlayModeIconContainer}>
                {showMovementButtons ? renderSwipeIcon() : renderArrowsIcon()}
              </div>
            </Button>
          </Show>
        </div>
        <div style={{ position: 'relative' }}>
          <Gameboard
            openLogIn={modal.show}
            isUserLoggedIn={selector.isSignedIn()}
            isAllowedResponse={isAllowedResponse!}
          />
        </div>
        {!notAllowedToPlay && !timerStarted && accountId && (
          <div className={styles.startGameBg}>
            <Heading as="h6" size="md">
              Play Cheddar Maze
            </Heading>
            <Button
              _hover={{ bg: 'yellowgreen' }}
              onClick={getStartGameButtonHandler()}
            >
              {gameOverFlag ? 'Restart' : 'Start'}
            </Button>
          </div>
        )}
        {showMovementButtons && (
          <Show below="lg">
            <div className={styles.arrowButtonsContainer}>
              <div className={styles.arrowButtonsFirstLine}>
                <Button
                  onClick={() => handleArrowPress('ArrowUp')}
                  isDisabled={!accountId || !timerStarted || notAllowedToPlay}
                >
                  <ArrowUpIcon />
                </Button>
              </div>
              <div className={styles.arrowButtonsSecondLine}>
                <Button
                  onClick={() => handleArrowPress('ArrowLeft')}
                  isDisabled={!accountId || !timerStarted || notAllowedToPlay}
                >
                  <ArrowBackIcon />
                </Button>
                <Button
                  onClick={() => handleArrowPress('ArrowDown')}
                  isDisabled={!accountId || !timerStarted || notAllowedToPlay}
                >
                  <ArrowDownIcon />
                </Button>
                <Button
                  onClick={() => handleArrowPress('ArrowRight')}
                  isDisabled={!accountId || !timerStarted || notAllowedToPlay}
                >
                  <ArrowForwardIcon />
                </Button>
              </div>
            </div>
          </Show>
        )}
      </div>
      <ModalBuyNFT onClose={onCloseBuyNFTPanel} isOpen={isOpenBuyNFTPanel} />
      <ModalRules isOpen={isOpenModalRules} onClose={onCloseModalRules} />
      {gameOverFlag && gameOverMessage.length > 0 && (
        <ModalContainer
          title={'Game over'}
          isOpen={isOpen}
          onClose={closeGameOverModal}
          neverCloseOnOverlayClick={true}
        >
          <GameOverModalContent
            setHolonymModal={setHolonymModal}
            onClose={closeGameOverModal}
          />
        </ModalContainer>
      )}
      {saveResponse && (
        <ModalContainer
          title={'Error saving game'}
          isOpen={isOpen}
          onClose={onClose}
        >
          <div>
            {saveResponse.map((error, index) => {
              return <div key={index}>{error}</div>;
            })}
          </div>
        </ModalContainer>
      )}
      <ModalContainer
        title={'Plinko game!'}
        isOpen={plinkoModalOpened}
        onClose={closePlinkoModal}
        size={isMobile ? 'full' : 'xl'}
        neverCloseOnOverlayClick={true}
      >
        <PlinkoBoard />
      </ModalContainer>
      <ModalContainer
        title={'Maze scoreboard'}
        isOpen={isScoreboardOpen}
        onClose={onCloseScoreboard}
        neverCloseOnOverlayClick={true}
      >
        <Scoreboard />
      </ModalContainer>
    </div>
  );
}
