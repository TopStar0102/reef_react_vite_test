import {gql} from "@apollo/client";

export const TRANSFER_HISTORY_GQL = gql`
  subscription query($accountId: String!) {
        transfers(
            where: {
                OR: [
                    {from: {id_eq: $accountId}},
                    {to: {id_eq: $accountId}}
                    ]
            }, limit: 15, orderBy: timestamp_DESC)
        {
            timestamp
            amount
            feeAmount
            fromEvmAddress
            id
            nftId
        success
        type
        toEvmAddress
        token{
          id
          name
          type
          contractData
        }
        extrinsic{
          id
          block{
            id
            height
            hash
          }
        }
        from{
          id
          evmAddress
        }
        to{
          id
          evmAddress
        }
    }
  }
`;
