"use strict";

const { createCallerValidator } = require("@acegalaxy/security-utils/caller-validator");

const validator = createCallerValidator({ extraFields: [] });

export = { resolveCaller: validator.resolveCaller };