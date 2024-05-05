rm -rf {index,react}.{,m,c}mjs {index,react}.d.ts \
\
&& npx tsc -p tsconfig.json \
; mv index.js index.mjs \
&& mv react.js react.mjs \
\
&& npx tsc -p tsconfig.cjs.json \
; mv index.js index.cjs \
&& mv react.js react.cjs \
&& sed -i 's/\.mjs/\.cjs/g' react.cjs
