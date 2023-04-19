import {gql} from "@apollo/client";

export const SIGNER_NFTS_GQL = gql`
  subscription query($accountId: String) {
    tokenHolders(
    orderBy: balance_DESC
    limit:199
    where: {AND: {nftId_isNull: false, token: {id_isNull: false}, signer: {id_eq: $accountId}, balance_gt: "0"}, type_eq: Account}
  ) {
    token {
      id
      type
    }
    balance
    nftId
  }
 }`;
