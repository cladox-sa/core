import * as Joi from "joi";
import * as Pagination from "../shared/schemas/pagination";

export const index: object = {
  query: {
    ...Pagination,
    ...{
      orderBy: Joi.string(),
      id: Joi.string().regex(/^[0-9]+$/, "numbers"),
      version: Joi.number()
        .integer()
        .min(0),
      timestamp: Joi.number()
        .integer()
        .min(0),
      previousBlock: Joi.string().regex(/^[0-9]+$/, "numbers"),
      height: Joi.number()
        .integer()
        .positive(),
      numberOfTransactions: Joi.number()
        .integer()
        .min(0),
      totalAmount: Joi.number()
        .integer()
        .min(0),
      totalFee: Joi.number()
        .integer()
        .min(0),
      reward: Joi.number()
        .integer()
        .min(0),
      payloadLength: Joi.number()
        .integer()
        .positive(),
      payloadHash: Joi.string().hex(),
      generatorPublicKey: Joi.string()
        .hex()
        .length(66),
      blockSignature: Joi.string().hex(),
    },
  },
};

export const show: object = {
  params: {
    id: Joi.string().regex(/^[0-9]+$/, "numbers"),
  },
};

export const transactions: object = {
  params: {
    id: Joi.string(),
  },
  query: {
    ...Pagination,
    ...{
      orderBy: Joi.string(),
      id: Joi.string()
        .hex()
        .length(66),
      blockId: Joi.string().regex(/^[0-9]+$/, "numbers"),
      type: Joi.number()
        .integer()
        .min(0),
      version: Joi.number()
        .integer()
        .min(0),
      senderPublicKey: Joi.string()
        .hex()
        .length(66),
      senderId: Joi.string()
        .alphanum()
        .length(34),
      recipientId: Joi.string()
        .alphanum()
        .length(34),
      timestamp: Joi.number()
        .integer()
        .min(0),
      amount: Joi.number()
        .integer()
        .min(0),
      fee: Joi.number()
        .integer()
        .min(0),
      vendorFieldHex: Joi.string().hex(),
    },
  },
};

export const search: object = {
  query: Pagination,
  payload: {
    id: Joi.string().regex(/^[0-9]+$/, "numbers"),
    version: Joi.number()
      .integer()
      .min(0),
    previousBlock: Joi.string().regex(/^[0-9]+$/, "numbers"),
    payloadHash: Joi.string().hex(),
    generatorPublicKey: Joi.string()
      .hex()
      .length(66),
    blockSignature: Joi.string().hex(),
    timestamp: Joi.object().keys({
      from: Joi.number()
        .integer()
        .min(0),
      to: Joi.number()
        .integer()
        .min(0),
    }),
    height: Joi.object().keys({
      from: Joi.number()
        .integer()
        .positive(),
      to: Joi.number()
        .integer()
        .positive(),
    }),
    numberOfTransactions: Joi.object().keys({
      from: Joi.number()
        .integer()
        .min(0),
      to: Joi.number()
        .integer()
        .min(0),
    }),
    totalAmount: Joi.object().keys({
      from: Joi.number()
        .integer()
        .min(0),
      to: Joi.number()
        .integer()
        .min(0),
    }),
    totalFee: Joi.object().keys({
      from: Joi.number()
        .integer()
        .min(0),
      to: Joi.number()
        .integer()
        .min(0),
    }),
    reward: Joi.object().keys({
      from: Joi.number()
        .integer()
        .min(0),
      to: Joi.number()
        .integer()
        .min(0),
    }),
    payloadLength: Joi.object().keys({
      from: Joi.number()
        .integer()
        .min(0),
      to: Joi.number()
        .integer()
        .min(0),
    }),
  },
};
