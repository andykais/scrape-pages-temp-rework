import * as path from 'path'
import '@test/setup'
import { rmrf } from '@scrape-pages/util/fs'
import { HttpFolderMock } from './nock-host-folder'
import { queryExecutionDebugger } from '@test/query-debugger'
// type imports
import { HttpMockOptions } from './nock-host-folder'

const RUN_OUTPUT_FOLDER = path.resolve(__dirname, '.run-output')
class FunctionalTestSetup {
  public outputFolder: string
  public mockHost: string
  private mockFolder: string
  public siteMock: HttpFolderMock
  public beforeEach: () => Promise<void>
  private mochaContext: Mocha.Context
  private previousTestWasStep: boolean

  constructor(testDirectory: string) {
    const testDirname = path.basename(testDirectory)
    this.outputFolder = path.resolve(RUN_OUTPUT_FOLDER, testDirname)
    this.mockHost = `http://${testDirname}`
    this.mockFolder = `${testDirectory}/fixtures`
    this.beforeEach = FunctionalTestSetup.beforeEachInternal(this)
    this.previousTestWasStep = false
  }

  // curried so that we can pick up the mocha context but also reference our own `this`
  static beforeEachInternal = (testEnv: FunctionalTestSetup) => {
    return async function() {
      testEnv.mochaContext = this.currentTest
      const isStep = testEnv.mochaContext.body.includes('markRemainingTestsAndSubSuitesAsPending')
      await rmrf(testEnv.outputFolder)
      testEnv.siteMock = new HttpFolderMock(testEnv.mockFolder, testEnv.mockHost)
      await testEnv.siteMock.init()
      testEnv.previousTestWasStep = isStep
    }
  }

  afterEach = () => {
    this.siteMock.done()
  }

  async restartHttpMock(options?: HttpMockOptions) {
    this.siteMock.done()
    this.siteMock = new HttpFolderMock(this.mockHost, this.mockFolder, options)
    await this.siteMock.init()
  }

  get queryDebugger() {
    this.mochaContext.timeout(0)
    return queryExecutionDebugger
  }
}

export { assertQueryResultPartial } from './assertions'
export { FunctionalTestSetup }
