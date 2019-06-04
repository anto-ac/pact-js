/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import path = require("path")
import * as sinonChai from "sinon-chai"
import { Pact, Interaction, Matchers } from "../../../src/pact"
import { Dog, Kennel } from "./kennel";

const expect = chai.expect
import { DogService } from "../index"
import { like } from "../../../src/dsl/matchers";
const { eachLike } = Matchers

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("The Dog API", () => {
  const url = "http://localhost"
  let dogService: DogService

  const provider = new Pact({
    // port,
    log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    spec: 2,
    consumer: "MyConsumer",
    provider: "MyProvider",
    pactfileWriteMode: "merge",
  })

  const kennel: Kennel =
  {
    name: "my kennel",
    dogs: [{name: "my dog"}]
  };

  const kennelWithMatchers = like(
    {
      ...kennel,
      dogs: eachLike(kennel.dogs[0])
    });

  before(() =>
    provider.setup().then(opts => {
      dogService = new DogService({ url, port: opts.port })
    })
  )

  after(() => provider.finalize())

  afterEach(() => provider.verify())

  describe("get /dogs using builder pattern", () => {
    before(() => {
      const interaction = new Interaction()
        .given("I have a list of dogs")
        .uponReceiving("a request for all dogs with the builder pattern")
        .withRequest({
          method: "GET",
          path: "/dogs",
          headers: {
            Accept: "application/json",
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: kennelWithMatchers,
        })

      return provider.addInteraction(interaction)
    })

    it("returns the correct response", done => {
      dogService.getMeDogs().then((response: any) => {
        expect(response.data[0]).to.deep.eq(kennel)
        done()
      }, done)
    })
  })

  describe("get /dogs using object pattern", () => {
    before(() => {
      return provider.addInteraction({
        state: "i have a list of dogs",
        uponReceiving: "a request for all dogs with the object pattern",
        withRequest: {
          method: "GET",
          path: "/dogs",
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: EXPECTED_BODY,
        },
      })
    })

    it("returns the correct response", done => {
      dogService.getMeDogs().then((response: any) => {
        expect(response.data[0]).to.deep.eq(dogExample)
        done()
      }, done)
    })
  })
})
