import * as Container from '@arkecosystem/core-container';
import { crypto, models } from '@arkecosystem/crypto';
import { formatTimestamp, bignumify } from '@arkecosystem/core-utils';

export default function(model) {
  const config = Container.resolvePlugin('config');
  const blockchain = Container.resolvePlugin('blockchain');

  const data = new models.Transaction(model.serialized.toString('hex'));
  const lastBlock = blockchain.getLastBlock();

  return {
    id: data.id,
    blockId: model.blockId,
    type: data.type,
    amount: +bignumify(data.amount).toFixed(),
    fee: +bignumify(data.fee).toFixed(),
    sender: crypto.getAddress(data.senderPublicKey, config.network.pubKeyHash),
    recipient: data.recipientId,
    signature: data.signature,
    signSignature: data.signSignature,
    signatures: data.signatures,
    vendorField: data.vendorField,
    asset: data.asset,
    confirmations: model.block ? lastBlock.data.height - model.block.height : 0,
    timestamp: formatTimestamp(data.timestamp),
  };
}