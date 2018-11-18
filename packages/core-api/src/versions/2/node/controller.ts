import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Container from '@arkecosystem/core-container';
import Controller from '../shared/controller';
import { blocksRepository, transactionsRepository } from '../../../repositories';

export default class NodeController extends Controller {
  protected config: any;
  protected blockchain: any;

  public constructor() {
    super();

    this.config = Container.resolvePlugin('config');
    this.blockchain = Container.resolvePlugin('blockchain');
  }

  public async status(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    try {
      const lastBlock = this.blockchain.getLastBlock();
      const networkHeight = await this.blockchain.p2p.getNetworkHeight();

      return {
        data: {
          synced: this.blockchain.isSynced(),
          now: lastBlock ? lastBlock.data.height : 0,
          blocksCount: networkHeight - lastBlock.data.height || 0,
        },
      };
    } catch (error) {
      return Boom.badImplementation(error);
    }
  }

  public async syncing(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    try {
      const lastBlock = this.blockchain.getLastBlock();
      const networkHeight = await this.blockchain.p2p.getNetworkHeight();

      return {
        data: {
          syncing: !this.blockchain.isSynced(),
          blocks: networkHeight - lastBlock.data.height || 0,
          height: lastBlock.data.height,
          id: lastBlock.data.id,
        },
      };
    } catch (error) {
      return Boom.badImplementation(error);
    }
  }

  public async configuration(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    try {
      const feeStatisticsData = await transactionsRepository.getFeeStatistics();

      return {
        data: {
          nethash: this.config.network.nethash,
          token: this.config.network.client.token,
          symbol: this.config.network.client.symbol,
          explorer: this.config.network.client.explorer,
          version: this.config.network.pubKeyHash,
          ports: super.toResource(request, this.config, 'ports'),
          constants: this.config.getConstants(this.blockchain.getLastBlock().data.height),
          feeStatistics: super.toCollection(
            request,
            feeStatisticsData,
            'fee-statistics',
          ),
        },
      };
    } catch (error) {
      return Boom.badImplementation(error);
    }
  }
}