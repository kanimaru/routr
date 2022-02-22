/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
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
import * as J from 'fp-ts/Json'
import * as E from 'fp-ts/Either'
import * as F from './fs'
import { EdgePortConfig } from '../types'
import { pipe } from 'fp-ts/function'
import { schema } from './schema'
import Ajv from "ajv"

const ajv = new Ajv()
const validate = ajv.compile(schema)

// Reads a file a returns as a string
export const readFile = (path: string): E.Either<Error, string> =>
  E.tryCatch(
    () => F.readFile(path),
    E.toError
  )

// Validate Json with Ajv
export const validateConfig = (j: J.Json): E.Either<Error, J.Json> =>
  E.tryCatch(
    () => {
      if (validate(j)) return j
      throw new Error(validate.errors[0].message)
    },
    E.toError
  )

// Read a file and validate its content with Ajv
export const getConfig = (path: string): E.Either<Error, EdgePortConfig> =>
  pipe(
    path,
    readFile,
    E.chain(value =>
      pipe(
        E.tryCatch(
          () => JSON.parse(value) as J.Json,
          E.toError
        ),
        E.chain(validateConfig),
      )
    ),
    E.map((v) => v as unknown as EdgePortConfig)
  )