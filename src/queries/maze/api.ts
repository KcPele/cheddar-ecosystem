import { PlayerScoreData } from '@/components/maze/Scoreboard';
import { getConfig } from '@/configs/config';

const { backendBaseUrl, holonym } = getConfig();

export async function isAllowed(accountId: string) {
  const url = new URL(
    `api/maze/isAllowed?accountId=${accountId}`,
    backendBaseUrl
  ).toString();
  const response = await fetch(url);
  const jsonResponse = await response.json();
  return jsonResponse;
}

export async function getPendingCheddarToMint(accountId: string) {
  const url = new URL(
    `api/maze/pendingCheddar?accountId=${accountId}`,
    backendBaseUrl
  ).toString();
  const response = await fetch(url);
  const jsonResponse = await response.json();
  return jsonResponse.ok ? jsonResponse.pendingCheddarToMint : 0;
}

export async function getEarnedButNotMinted(accountId: string) {
  const url = new URL(
    `api/maze/getNonMintedCheddar?accountId=${accountId}`,
    backendBaseUrl
  ).toString();
  const response = await fetch(url);
  const jsonResponse = await response.json();
  return jsonResponse.ok ? jsonResponse.pendingCheddarToMint : 0;
}

export async function getEarnedAndMinted(accountId: string) {
  const url = new URL(
    `api/maze/mintedCheddar?accountId=${accountId}`,
    backendBaseUrl
  ).toString();
  const response = await fetch(url);
  const jsonResponse = await response.json();
  return jsonResponse.ok ? jsonResponse.totalMinted : 0;
}

export async function getSeedId(accountId: string) {
  const data = {
    accountId,
  };
  const url = new URL(`api/maze/getSeedId`, backendBaseUrl).toString();

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getScoreBoard() {
  const url = new URL(`/api/maze/scoreboard`, backendBaseUrl).toString();
  const response = await fetch(url);
  const jsonResponse = await response.json();
  return jsonResponse as PlayerScoreData | Promise<any> | undefined;
}

export interface EndGameRequest {
  data: {
    cheddarEarned: number;
    score: number;
    path: number[];
  };
  metadata: {
    accountId: string;
    seedId: number;
    referralAccount?: string;
  };
}

export async function callEndGame(endGameData: EndGameRequest) {
  const url = new URL(`api/maze/endGame`, backendBaseUrl).toString();

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(endGameData),
  });
  return response.json();
}

export async function callMintCheddar(mintCheddarBody: { accountId: string }) {
  const url = new URL(
    `api/maze/mintNonMintedCheddar`,
    backendBaseUrl
  ).toString();

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mintCheddarBody),
  });
  return response.json();
}

export async function isHolonymVerified(accountId: string): Promise<boolean> {
  const govResp = await fetch(holonym.govIdSBT + `&user=${accountId}`);
  const phoneResp = await fetch(holonym.phoneSBT + `&user=${accountId}`);

  const { result: isUniqueId } = await govResp.json();
  const { result: isUniquePhone } = await phoneResp.json();
  return isUniqueId || isUniquePhone;
}
