import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
DELETE FROM commands;
DELETE FROM crawlerTree;
DELETE FROM networkRequests WHERE status = 'QUEUED'
`

class TruncateTables extends Query {
  call = () => {
    this.database.pragma('foreign_keys = OFF')
    this.database.exec(template)
    this.database.pragma('foreign_keys = ON')
  }
}

export { TruncateTables }
