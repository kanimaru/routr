/*
 * Copyright (C) 2022 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { APIVersion, Prisma } from "@prisma/client"
import chai from "chai"
import sinon from "sinon"
import sinonChai from "sinon-chai"
import { DomainManager } from "../src/mappers/domain"

const expect = chai.expect
chai.use(sinonChai)
const sandbox = sinon.createSandbox()

describe("@routr/pgdata/mappers/domain", () => {
  afterEach(() => sandbox.restore())

  it("takes a dto object and converts it to prisma model", () => {
    // Arrange
    const domain = {
      apiVersion: "v2",
      ref: "domain-01",
      name: "Local Domain",
      accessControlListRef: "acl-01",
      domainUri: "sip.local",
      extended: {
        test: "test"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Act
    const result = new DomainManager(domain).mapToPrisma()

    // Assert
    expect(result).to.deep.equal(domain)
  })

  it("takes a prisma model and converts it to dto object", () => {
    // Arrange
    type DomainWithACL = Prisma.DomainGetPayload<{
      include: {
        accessControlList: true
      }
    }>

    const domain: DomainWithACL = {
      apiVersion: "v2" as APIVersion,
      ref: "domain-01",
      name: "Local Domain",
      accessControlListRef: "acl-01",
      domainUri: "sip.local",
      extended: {
        test: "test"
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      accessControlList: {
        apiVersion: "v2" as APIVersion,
        ref: "acl-01",
        name: "test",
        allow: ["192.168.1.2/31"],
        deny: ["0.0.0.0/1"],
        extended: {
          test: "test"
        }
      }
    }

    // Act
    const result = DomainManager.mapToDto(domain)

    // Assert
    expect(result).to.deep.equal(domain)
  })

  describe("throws errors", () => {
    it("when the friendly name is not provided for create or update operations", () => {
      // Arrange
      const domain = {
        apiVersion: "v2",
        ref: "domain-01",
        name: "",
        accessControlListRef: "acl-01",
        domainUri: "sip.local",
        extended: {
          test: "test"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Act
      const updateResult = () => new DomainManager(domain).validOrThrowUpdate()
      const createResult = () => new DomainManager(domain).validOrThrowCreate()

      // Assert
      expect(updateResult).to.throw(
        "the friendly name for the resource is required"
      )
      expect(createResult).to.throw(
        "the friendly name for the resource is required"
      )
    })

    it("when the friendly namy has less than 3 or more than 64 characters", () => {
      // Arrange
      const domain = {
        apiVersion: "v2",
        ref: "domain-01",
        name: "Lo",
        accessControlListRef: "acl-01",
        domainUri: "sip.local",
        extended: {
          test: "test"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Act
      const updateResult = () => new DomainManager(domain).validOrThrowUpdate()
      const createResult = () => new DomainManager(domain).validOrThrowCreate()

      // Assert
      expect(updateResult).to.throw(
        "the friendly name must be between 3 and 64 characters"
      )
      expect(createResult).to.throw(
        "the friendly name must be between 3 and 64 characters"
      )
    })

    it("when the reference is not provided for an update operation", () => {
      // Arrange
      const domain = {
        apiVersion: "v2",
        ref: "",
        name: "Local Domain",
        accessControlListRef: "acl-01",
        domainUri: "sip.local",
        extended: {
          test: "test"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Act
      const result = () => new DomainManager(domain).validOrThrowUpdate()

      // Assert
      expect(result).to.throw("the reference to the resource is required")
    })

    it("when domainUri is not a valid FQDN", () => {
      // Arrange
      const domain = {
        apiVersion: "v2",
        ref: "domain-01",
        name: "Local Domain",
        accessControlListRef: "acl-01",
        domainUri: "sip-local",
        extended: {
          test: "test"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Act
      const result = () => new DomainManager(domain).validOrThrowCreate()

      // Assert
      expect(result).to.throw(
        "the domainUri must be a valid fully qualified domain name"
      )
    })
  })
})