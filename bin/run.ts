#!/usr/bin/env node

if (process.env.NODE_ENV !== "test") {
  // tslint:disable-next-line:no-console
  console.log(`ss-ui  Copyright (C) 2017 coderfox\n
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it
under certain conditions.
For more information, see "${__dirname}/../LICENSE.md".
`);
}

import config from "../lib/config";
import db from "../lib/db";
import { connection } from "../lib/db";
import "../lib/email";
import log from "../lib/log";
import server from "../server";
import User from "../models/user";
import * as uuid from "uuid/v4";

if (process.env.NODE_ENV === "test") {
  log.level = "silent";
} else if (process.env.NODE_ENV === "dev") {
  log.level = "debug";
} else {
  log.level = "info";
}

const PORT = config.get("port") || 3000;

db
  .then(() => {
    log.info(`database connected to ${config.get("db_path")}`);
    server.listen(PORT);
    log.info(`server listening on port ${PORT}`);
  })
  .then(async () => {
    const users = await connection.getRepository(User).find();
    for(const user of users) {
      if(! user.vmessUid ) {
        user.vmessUid = uuid();
        await connection.getRepository(User).save(user);
      }
    }
  })
  .catch((err: any ) => log.error(err));
