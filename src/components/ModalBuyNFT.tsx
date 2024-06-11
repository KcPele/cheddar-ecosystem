import {
  FormControl,
  FormLabel,
  Button,
  useToast,
  Image,
  VStack,
  Text,
} from '@chakra-ui/react';
import { ModalContainer } from './ModalContainer';
import { useWalletSelector } from '@/contexts/WalletSelectorContext';
import { RadioButtonBroup } from './RadioButtonGroup';
import { useEffect, useState } from 'react';
import { RenderCheddarIcon } from './RenderCheddarIcon';
import { RenderNearIcon } from './RenderNearIcon';
import { buyNFT } from '@/contracts/cheddarCalls';

import styles from '../styles/BuyNFTSection.module.css';
import { useGetCheddarNFTPrice } from '@/hooks/cheddar';
import { yton } from '@/contracts/contractUtils';
import { getTransactionLastResult } from 'near-api-js/lib/providers';
import { MintNFTLastResult } from '@/entities/interfaces';
import { getConfig } from '@/configs/config';

interface Props {
  onClose: () => void;
  isOpen: boolean;
}

export const ModalBuyNFT = ({ isOpen, onClose }: Props) => {
  const { nftImageBaseUrl } = getConfig().networkData;
  const [nftId, setNftId] = useState('');
  const [showNftImage, setShowNftImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { selector } = useWalletSelector();
  const {
    data: cheddarNftPriceInCheddar,
    isLoading: isNftPriceInCheddarLoading,
  } = useGetCheddarNFTPrice(true);
  const { data: cheddarNftPriceInNear, isLoading: isNftPriceInNearLoading } =
    useGetCheddarNFTPrice(false);
  const toast = useToast();

  //The first option is the default one
  const payingOptions = [
    {
      name: 'Cheddar',
      price: isNftPriceInCheddarLoading
        ? 'Loading'
        : yton(cheddarNftPriceInCheddar!),
      icon: <RenderCheddarIcon className={styles.tokenIcon} />,
    },
    {
      name: 'Near',
      price: isNftPriceInNearLoading ? 'Loading' : yton(cheddarNftPriceInNear!),
      icon: <RenderNearIcon className={styles.tokenIcon} />,
    },
  ];

  const [tokenToPayWith, setTokenToPayWith] = useState(payingOptions[0].name);
  const [errorMsg, setErrorMsg] = useState(undefined as undefined | string);

  const modalTitle = errorMsg ? 'Something went wrong' : 'Success';

  async function handlePurchase() {
    try {
      setIsLoading(true);
      const wallet = await selector.wallet();
      const withCheddar = tokenToPayWith === 'Cheddar';
      const amount = withCheddar
        ? cheddarNftPriceInCheddar
        : cheddarNftPriceInNear;
      const resp = await buyNFT(wallet, withCheddar, amount!);
      const genericLastResult = await getTransactionLastResult(resp);
      const lastResult: MintNFTLastResult = withCheddar
        ? genericLastResult[1]
        : genericLastResult;
      if (lastResult.token_id) {
        setNftId(lastResult.token_id);
      }
      toast({
        title: 'Enjoy your purchase!',
        status: 'success',
        duration: 9000,
        position: 'bottom-right',
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: err.message,
        status: 'error',
        duration: 9000,
        position: 'bottom-right',
        isClosable: true,
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!isOpen) {
      setNftId('');
      setShowNftImage(true);
    }
  }, [isOpen]);

  return (
    <ModalContainer title="Buy Cheddar NFT" onClose={onClose} isOpen={isOpen}>
      {nftId ? (
        <VStack>
          <Text>NFT Minted Succesfully!</Text>
          {showNftImage && (
            <Image
              onError={() => setShowNftImage(false)}
              src={`${nftImageBaseUrl}${nftId}.png`}
              alt={`chedar nft ${nftId}`}
            />
          )}
        </VStack>
      ) : (
        <form className={styles.form}>
          <FormControl isRequired>
            <FormLabel>Choose token to pay with:</FormLabel>
            <RadioButtonBroup
              options={payingOptions}
              optionSelected={tokenToPayWith}
              setOptionSelected={setTokenToPayWith}
            />
          </FormControl>

          <FormLabel>
            {payingOptions.map((option) => {
              if (option.name === tokenToPayWith) {
                return (
                  <>
                    {`Cost: ${option.price}`} {option.icon}
                  </>
                );
              }
              return <></>;
            })}
          </FormLabel>
          <Button
            colorScheme="yellow"
            color="white"
            onClick={handlePurchase}
            isLoading={isLoading}
          >
            Purchase
          </Button>
        </form>
      )}
    </ModalContainer>
  );
};
