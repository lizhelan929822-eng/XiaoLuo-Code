import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { Box, Text } from '../../ink.js';

type Props = {
  pose?: string;
};

export function Clawd(t0) {
  const $ = _c(2);
  let t1;
  if ($[0] !== t0) {
    t1 = t0 === undefined ? {} : t0;
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = (
      <Box flexDirection="column" alignItems="center">
        <Text color="clawd_body">╔═════════════════════╗</Text>
        <Text color="clawd_body">║    XiaoLuo Code     ║</Text>
        <Text color="clawd_body">╚═════════════════════╝</Text>
      </Box>
    );
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  return t2;
}
