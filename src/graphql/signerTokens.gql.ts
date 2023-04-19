import {gql} from "@apollo/client";

export const SIGNER_TOKENS_GQL = gql`
  subscription tokens_query($accountId: String!) {
   tokenHolders(
        where: {AND: {nftId_isNull: true, token: {id_isNull: false}, signer: {id_eq: $accountId}, balance_gt: "0"}},
        orderBy: balance_DESC,
        limit: 320
    ) {
        token {
          id
        }
        balance
    }
 }
`;
