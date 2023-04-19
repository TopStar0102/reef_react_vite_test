import {Provider, Signer} from '@reef-defi/evm-provider';
import type {Signer as InjectedSigner, } from '@polkadot/api/types';
import {web3FromSource} from '@reef-defi/extension-dapp';
import {ReefAccount} from "./accountModel";
import {REEF_EXTENSION_IDENT} from "@reef-defi/extension-inject";
import {accountsJsonSigningKeySubj} from "../reefState/account/setAccounts";
import {SignerPayloadJSON, SignerPayloadRaw, SignerResult} from "@polkadot/types/types/extrinsic";
import { Deferrable } from '@ethersproject/properties';
import {
  TransactionRequest,
  TransactionResponse
} from '@ethersproject/abstract-provider';

const accountSourceSigners = new Map<string, InjectedSigner>();
const addressSigners = new Map<string, Signer|undefined>();

const getAccountInjectedSigner = async (
    source: string = REEF_EXTENSION_IDENT,
): Promise<InjectedSigner|undefined> => {
  if (!accountSourceSigners.has(source)) {
    const signer = await web3FromSource(source)
        .then((injected) => injected?.signer)
        .catch((err) => console.error('getAccountSigner error =', err));
    if (!signer) {
      console.warn('Can not get signer for source=' + source);
    }
    if (signer) {
      accountSourceSigners.set(source, signer);
    }
  }
  return accountSourceSigners.get(source)!;
};

export const getReefAccountSigner = async ({address, source}: ReefAccount, provider: Provider)=>{
  const src = accountsJsonSigningKeySubj.getValue()||source;
  return getAccountSigner(address, provider, src);
}

export const getAccountSigner = async (
    address: string,
    provider: Provider,
    // source?: string,
    injSignerOrSource?: InjectedSigner|string,
): Promise<Signer | undefined> => {
  let signingKey: InjectedSigner|undefined = injSignerOrSource as InjectedSigner;
  if (!injSignerOrSource || typeof injSignerOrSource === 'string') {
    signingKey =  await getAccountInjectedSigner(injSignerOrSource);
  }

  if (!addressSigners.has(address)) {
    addressSigners.set(address, (signingKey ? (new ReefSignerWrapper(provider, address, new ReefSigningKeyWrapper(signingKey))) : undefined));
  }
  return addressSigners.get(address);
};

export class ReefSigningKeyWrapper implements InjectedSigner {
  private sigKey: InjectedSigner|undefined;
  constructor(signingKey?: InjectedSigner) {
    this.sigKey=signingKey;
  }

  signPayload (payload: SignerPayloadJSON) {
    console.log('SIG PAYLOAD=',payload.method)

    return this.sigKey?.signPayload?this.sigKey.signPayload(payload).then(res=>{
      // console.log('SIGG DONE')
      return res;
    }, rej=>{
      // console.log('SIGG REJJJJ')
      throw rej;
    }):Promise.reject('ReefSigningKeyWrapper - not implemented');
  };

  signRaw (raw: SignerPayloadRaw){
    return this.sigKey?.signRaw?this.sigKey.signRaw(raw):Promise.reject('ReefSigningKeyWrapper - not implemented');
  };

}

export class ReefSignerWrapper extends Signer {
  constructor(provider: Provider, address: string, signingKey: InjectedSigner) {
    super(provider, address, signingKey);
  }

  sendTransaction(_transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    console.log('TRXXXXX= ', _transaction)
    return super.sendTransaction(_transaction);
  }
}
