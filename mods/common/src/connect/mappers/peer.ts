/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster
 *
 * This file is part of Routr.
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
/* eslint-disable require-jsdoc */
import { PeerConfig } from "../config"
import { schemaValidators } from "../schemas"
import { Peer, Kind } from "../types"
import { assertValidSchema } from "./assertions"

const valid = schemaValidators.get(Kind.PEER)

export function mapToPeer(config: PeerConfig): Peer {
  assertValidSchema(config, valid)

  return {
    apiVersion: config.apiVersion,
    ref: config.ref,
    name: config.metadata.name,
    username: config.spec.username,
    aor: config.spec.aor,
    contactAddr: config.spec.contactAddr,
    enabled: config.spec.enabled as boolean,
    credentialsRef: config.spec.credentialsRef
  }
}
