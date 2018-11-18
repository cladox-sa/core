import * as Container from "@arkecosystem/core-container";
import { bignumify } from "@arkecosystem/core-utils";

export default function(model) {
  const lastBlock = Container.resolvePlugin("blockchain").getLastBlock();

  return {
    id: model.id,
    version: model.version,
    timestamp: model.timestamp,
    previousBlock: model.previousBlock,
    height: model.height,
    numberOfTransactions: model.numberOfTransactions,
    totalAmount: +bignumify(model.totalAmount).toFixed(),
    totalForged: +bignumify(model.reward)
      .plus(model.totalFee)
      .toString(),
    totalFee: +bignumify(model.totalFee).toFixed(),
    reward: +bignumify(model.reward).toFixed(),
    payloadLength: model.payloadLength,
    payloadHash: model.payloadHash,
    generatorPublicKey: model.generatorPublicKey,
    blockSignature: model.blockSignature,
    confirmations: lastBlock ? lastBlock.data.height - model.height : 0,
  };
}
