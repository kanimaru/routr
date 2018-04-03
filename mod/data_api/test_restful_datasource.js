/**
 * @author Pedro Sanders
 * @since v1
 *
 * Unit Test for the "Restful Data Source"
 */
import RestfulDataSource from 'data_api/restful_datasource'
import { Status } from 'data_api/status'
import TestUtils from 'data_api/test_utils.js'
import getConfig from 'core/config_util.js'

export let testGroup = { name: "Restful Data Source", enabled: false}

const config = getConfig()
// Forces data source to use its own default parameters...
delete config.spec.dataSource.parameters

const ds = new RestfulDataSource(config)
const ObjectId = Packages.org.bson.types.ObjectId

testGroup.basic_operations = function () {
    const agent = TestUtils.buildAgent('John Doe', ['sip.local'], '1001')

    const initSize = ds.withCollection('agents').find().result.length
    let response = ds.insert(agent)
    const ref = response.result
    let endSize = ds.withCollection('agents').find().result.length

    assertTrue(ObjectId.isValid(ref))
    assertTrue(endSize == (initSize + 1))
    assertTrue(agent.metadata.name.equals("John Doe"))

    agent.metadata.name = "Jae Doe"
    agent.metadata.ref = ref
    response = ds.update(agent)
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('agents').remove(ref)
    assertTrue(response.status == Status.OK)

    response =  ds.withCollection('agents').find()
    endSize = response.result.length
    assertTrue (initSize == endSize)
}

testGroup.get_collections = function () {
    let response = ds.withCollection('agents').find('*')
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('dids').find('*')
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('agents').find("@.spec.credentials.username=='john'|| @.spec.credentials.username=='janie'")
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('agents').find("@.spec.credentials.username=='john'")
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('agents').find("@.spec.credentials.username=='jhon'")
    assertTrue(response.status == Status.NOT_FOUND)

    response = ds.withCollection('agents').find("@.spec.credentials.username==jhon'")
    assertTrue(response.status == Status.BAD_REQUEST)
}

// This also validates the other resources
testGroup.get_gateways = function () {
    const response = gatewaysAPI.getGateways()
    assertTrue(response.status == Status.OK)
}

// This also validates the other resources
testGroup.update_gateway = function () {
    const gateway = TestUtils.buildGateway('Voip2 MS', '215706')
    let response = ds.insert(gateway)
    const ref = response.result
    assertTrue(response.status == Status.CREATED)

    gateway.metadata.name = 'Voip Change'
    gateway.metadata.ref = ref
    response = ds.update(gateway)

    assertTrue(response.status == Status.OK)
    response = ds.withCollection('gateways').remove(ref)
    assertTrue(response.status == Status.OK)
}

// This also validates the other resources
testGroup.update_domain = function () {
    const domain = TestUtils.buildDomain(name, domainUri)
    let response = ds.insert(domain)
    const ref = response.result
    assertTrue(response.status == Status.CREATED)

    domain.metadata.name = 'Walmart2 Local'
    domain.metadata.ref = ref
    response = ds.update(domain)
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('domains').remove(ref)
    assertTrue(response.status == Status.OK)
}

// This also validates the other resources
testGroup.update_did = function () {
    const did = TestUtils.buildDID()
    let response = ds.insert(did)
    const ref = response.result
    assertTrue(response.status == Status.CREATED)

    did.metadata.geoInfo.city = 'Cameron, GA'
    did.metadata.ref = ref
    response = ds.update(did)
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('dids').remove(ref)
    assertTrue(response.status == Status.OK)
}

// This also validates the other resources
testGroup.update_peer = function () {
    const peer = TestUtils.buildPeer(name, 'ast', username)
    let response = ds.insert(peer)
    const ref = response.result
    assertTrue(response.status == Status.CREATED)

    peer.metadata.name = 'Asterisk PBX'
    peer.metadata.ref = ref
    response = ds.update(peer)
    assertTrue(response.status == Status.OK)

    response = ds.withCollection('peers').remove(ref)
    assertTrue(response.status == Status.OK)
}