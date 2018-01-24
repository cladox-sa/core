const Op = require('sequelize').Op
const moment = require('moment')
const Transaction = requireFrom('model/transaction')
const buildFilterQuery = require('../utils/filter-query')

class TransactionsRepository {
  constructor (db) {
    this.db = db
  }

  all (queryParams, legacy = false) {
    let whereStatement = {}
    let orderBy = []

    const filter = ['type', 'senderPublicKey', 'recipientId', 'amount', 'fee', 'blockId']
    for (const elem of filter) {
      if (queryParams[elem]) { whereStatement[elem] = queryParams[elem] }
    }

    if (queryParams['senderId']) {
      let account = this.db.localaccounts[queryParams['senderId']]

      if (account) whereStatement['senderPublicKey'] = account.publicKey
    }

    if (queryParams.orderBy) {
      let order = queryParams.orderBy.split(':')

      if (['timestamp', 'type', 'amount'].includes(order[0])) orderBy.push(queryParams.orderBy.split(':'))
    }

    // Version 1
    if (legacy) {
      return this.db.transactionsTable.findAndCountAll({
        where: whereStatement,
        order: orderBy,
        offset: parseInt(queryParams.offset || 1),
        limit: parseInt(queryParams.limit || 100),
        include: {
          model: this.db.blocksTable,
          attributes: ['height']
        }
      })
    }

    // Version 2
    return this.db.transactionsTable.findAndCountAll({
      // attributes: ['serialized'],
      where: whereStatement,
      order: orderBy,
      offset: parseInt(queryParams.offset || 1),
      limit: parseInt(queryParams.limit || 100),
      include: {
        model: this.db.blocksTable,
        attributes: ['height']
      }
    })
    // .then(results => {
    //   return {
    //     count: results.count,
    //     rows: results.rows.map(row => Transaction.deserialize(row.serialized.toString('hex')))
    //   }
    // })
  }

  paginate (pager, queryParams = {}) {
    let offset = (pager.page > 1) ? pager.page * pager.perPage : 0

    return this.all(Object.assign(queryParams, {
      offset,
      limit: pager.perPage
    }))
  }

  paginateAllByWallet (wallet, pager) {
    return this.paginate(pager, {
      [Op.or]: [{
        senderPublicKey: wallet.publicKey
      }, {
        recipientId: wallet.address
      }]
    })
  }

  paginateAllBySender (senderPublicKey, pager) {
    return this.paginate(pager, { senderPublicKey })
  }

  paginateAllByRecipient (recipientId, pager) {
    return this.paginate(pager, { recipientId })
  }

  paginateVotesBySender (senderPublicKey, pager) {
    return this.paginate(pager, { senderPublicKey, type: 3 })
  }

  paginateByBlock (blockId, pager) {
    return this.paginate(pager, { blockId })
  }

  paginateByType (type, pager) {
    return this.paginate(pager, { type })
  }

  findById (id) {
    return this.db.transactionsTable.findById(id, {
      include: {
        model: this.db.blocksTable,
        attributes: ['height']
      }
    })
  }

  findByIdAndType (id, type) {
    return this.db.transactionsTable.findOne({
      where: {id, type},
      include: {
        model: this.db.blocksTable,
        attributes: ['height']
      }
    })
  }

  allByDateAndType (type, from, to) {
    return this.db.transactionsTable.findAndCountAll({
      attributes: ['serialized'],
      where: {
        type: type,
        createdAt: {
          [Op.lte]: moment(to).endOf('day').toDate(),
          [Op.gte]: moment(from).startOf('day').toDate()
        }
      },
      include: {
        model: this.db.blocksTable,
        attributes: ['height']
      }
    }).then(results => {
      return {
        count: results.count,
        rows: results.rows.map(row => Transaction.deserialize(row.serialized.toString('hex')))
      }
    })
  }

  search (params) {
    return this.db.transactionsTable
      .findAndCountAll({
        // attributes: ['serialized'],
        where: buildFilterQuery(
          params,
          {
            exact: ['id', 'blockId', 'type', 'version', 'senderPublicKey', 'recipientId'],
            between: ['timestamp', 'amount', 'fee'],
            wildcard: ['vendorFieldHex']
          }
        ),
        include: {
          model: this.db.blocksTable,
          attributes: ['height']
        }
      })
      // .then(results => {
      //   return {
      //     count: results.count,
      //     rows: results.rows.map(row => Transaction.deserialize(row.serialized.toString('hex')))
      //   }
      // })
  }
}

module.exports = TransactionsRepository