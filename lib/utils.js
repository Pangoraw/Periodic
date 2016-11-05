'use babel';

import fs from "fs";
import path from "path";

function isPathValid(filePath) {
  return [ ".sqlite", ".db" ].indexOf(path.extname(filePath)) !== -1 && fs.existsSync(filePath);
}

export default { isPathValid };
